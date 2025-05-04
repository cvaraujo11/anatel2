import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSleepEntryDto } from './dto/create-sleep-entry.dto';
import { UpdateSleepEntryDto } from './dto/update-sleep-entry.dto';
import { SleepEntry } from './entities/sleep-entry.entity';

@Injectable()
export class SleepEntriesService {
  constructor(
    @InjectRepository(SleepEntry)
    private readonly sleepEntryRepository: Repository<SleepEntry>,
  ) {}

  async create(createSleepEntryDto: CreateSleepEntryDto, userId: string): Promise<SleepEntry> {
    const newEntry = this.sleepEntryRepository.create({
      // Mapeia DTO (camelCase) para Entidade (snake_case)
      sleep_date: createSleepEntryDto.sleepDate, // TypeORM pode lidar com string ISO para Date
      start_time: new Date(createSleepEntryDto.startTime), // Convert string to Date
      end_time: new Date(createSleepEntryDto.endTime),     // Convert string to Date
      duration_minutes: createSleepEntryDto.durationMinutes,
      quality_score: createSleepEntryDto.qualityScore,
      notes: createSleepEntryDto.notes,
      user: { id: userId }, // Associa ao usuário pelo ID
    });
    return this.sleepEntryRepository.save(newEntry);
  }

  async findAll(userId: string): Promise<SleepEntry[]> {
    return this.sleepEntryRepository.find({
      where: { user: { id: userId } },
      order: { sleep_date: 'DESC', start_time: 'DESC' }, // Usa snake_case para ordenar
    });
  }

  async findOne(id: string, userId: string): Promise<SleepEntry> {
    const entry = await this.sleepEntryRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!entry) {
      throw new NotFoundException(`Sleep entry with ID "${id}" not found for this user.`);
    }
    return entry;
  }

  async update(id: string, updateSleepEntryDto: UpdateSleepEntryDto, userId: string): Promise<SleepEntry> {
    // Garante que a entrada existe e pertence ao usuário antes de atualizar
    const existingEntry = await this.findOne(id, userId);

    // Prepara os dados para atualização, mapeando DTO para entidade
    const updatePayload: Partial<SleepEntry> = {};
    if (updateSleepEntryDto.sleepDate !== undefined) {
      updatePayload.sleep_date = updateSleepEntryDto.sleepDate;
    }
    if (updateSleepEntryDto.startTime !== undefined) {
      updatePayload.start_time = new Date(updateSleepEntryDto.startTime);
    }
    if (updateSleepEntryDto.endTime !== undefined) {
      updatePayload.end_time = new Date(updateSleepEntryDto.endTime);
    }
    if (updateSleepEntryDto.durationMinutes !== undefined) {
      updatePayload.duration_minutes = updateSleepEntryDto.durationMinutes;
    }
    if (updateSleepEntryDto.qualityScore !== undefined) {
      updatePayload.quality_score = updateSleepEntryDto.qualityScore;
    }
    if (updateSleepEntryDto.notes !== undefined) {
      updatePayload.notes = updateSleepEntryDto.notes;
    }

    // Mescla os dados atualizados com a entrada existente
    // O merge lida com a atualização apenas dos campos fornecidos em updatePayload
    const updatedEntry = this.sleepEntryRepository.merge(existingEntry, updatePayload);

    return this.sleepEntryRepository.save(updatedEntry);
  }

  async remove(id: string, userId: string): Promise<void> {
    const entry = await this.findOne(id, userId); // Garante que a entrada existe e pertence ao usuário
    const result = await this.sleepEntryRepository.delete(entry.id);
    if (result.affected === 0) {
      // Embora findOne já verifique, é uma segurança adicional
      throw new NotFoundException(`Sleep entry with ID "${id}" could not be deleted.`);
    }
  }
}