import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { UpdateMoodEntryDto } from './dto/update-mood-entry.dto';
import { MoodEntry } from './entities/mood-entry.entity';

@Injectable()
export class MoodEntriesService {
  constructor(
    @InjectRepository(MoodEntry)
    private readonly moodEntryRepository: Repository<MoodEntry>,
  ) {}

  async create(createMoodEntryDto: CreateMoodEntryDto, userId: string): Promise<MoodEntry> {
    // Mapeia DTO para entidade, convertendo data e associando usuário
    // Mapeia DTO para entidade, associando o usuário pela relação
    const newEntry = this.moodEntryRepository.create({
      mood_score: createMoodEntryDto.moodScore,
      notes: createMoodEntryDto.notes,
      entry_date: createMoodEntryDto.entryDate, // Mantém como string (YYYY-MM-DD)
      user: { id: userId }, // Associa a relação User pelo ID
    });
    return this.moodEntryRepository.save(newEntry);
  }

  async findAll(userId: string): Promise<MoodEntry[]> {
    return this.moodEntryRepository.find({
      where: { user: { id: userId } }, // Filtra pela relação User
      order: { entry_date: 'DESC' },
      relations: ['user'], // Opcional: carregar dados do usuário se necessário (removido por simplicidade)
    });
  }

  async findOne(id: string, userId: string): Promise<MoodEntry> {
    const entry = await this.moodEntryRepository.findOne({
      where: { id, user: { id: userId } }, // Filtra pela relação User
      // relations: ['user'], // Opcional
    });
    if (!entry) {
      throw new NotFoundException(`Entrada de humor com ID "${id}" não encontrada para este usuário.`);
    }
    return entry;
  }

  async update(id: string, updateMoodEntryDto: UpdateMoodEntryDto, userId: string): Promise<MoodEntry> {
    // Garante que a entrada existe e pertence ao usuário antes de tentar atualizar
    const existingEntry = await this.findOne(id, userId);

    // Prepara os dados para atualização, mapeando DTO para entidade
    const updateData: Partial<MoodEntry> = {};
    if (updateMoodEntryDto.moodScore !== undefined) {
      updateData.mood_score = updateMoodEntryDto.moodScore;
    }
    if (updateMoodEntryDto.notes !== undefined) {
      updateData.notes = updateMoodEntryDto.notes;
    }
    if (updateMoodEntryDto.entryDate) {
      updateData.entry_date = updateMoodEntryDto.entryDate; // Mantém como string
    }

    // Verifica se há dados para atualizar antes de executar o update
    if (Object.keys(updateData).length === 0) {
      return existingEntry; // Retorna a entrada existente se nada mudou
    }

    // O método update não funciona bem com relações diretamente no critério.
    // É mais seguro carregar a entidade, atualizar e salvar.
    // No entanto, para manter simples e usar 'update', filtramos apenas pelo 'id'
    // e a verificação 'findOne' inicial garante que pertence ao usuário.
    await this.moodEntryRepository.update(id, updateData);

    // Retorna a entidade atualizada
    // É necessário buscar novamente pois 'update' retorna UpdateResult
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Garante que a entrada existe e pertence ao usuário antes de tentar remover
    await this.findOne(id, userId);
    // Similar ao update, a verificação findOne garante a propriedade.
    const result = await this.moodEntryRepository.delete(id);

    if (result.affected === 0) {
      // Embora findOne já verifique, é uma segurança adicional
      throw new NotFoundException(`Não foi possível remover a entrada de humor com ID "${id}".`);
    }
  }
}