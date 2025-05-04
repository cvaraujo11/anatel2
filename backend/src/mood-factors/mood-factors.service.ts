import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoodFactor } from './entities/mood-factor.entity';
import { CreateMoodFactorDto } from './dto/create-mood-factor.dto';
import { UpdateMoodFactorDto } from './dto/update-mood-factor.dto';
import { MoodEntriesService } from '../mood-entries/mood-entries.service'; // Para verificar propriedade
import { User } from '../users/entities/user.entity'; // Para tipo do usuário

@Injectable()
export class MoodFactorsService {
  constructor(
    @InjectRepository(MoodFactor)
    private moodFactorsRepository: Repository<MoodFactor>,
    private moodEntriesService: MoodEntriesService, // Injeta o serviço de entradas de humor
  ) {}

  async create(createMoodFactorDto: CreateMoodFactorDto, user: User): Promise<MoodFactor> {
    // 1. Verificar se a moodEntryId pertence ao usuário
    const moodEntry = await this.moodEntriesService.findOne(createMoodFactorDto.moodEntryId, user.id);
    // findOne já lança NotFoundException se não encontrar ou ForbiddenException se não pertencer ao usuário

    // 2. Criar e salvar o novo fator de humor
    const newMoodFactor = this.moodFactorsRepository.create({
      ...createMoodFactorDto,
      moodEntry: moodEntry, // Associa a entrada de humor validada
    });
    return this.moodFactorsRepository.save(newMoodFactor);
  }

  async findAllByMoodEntry(moodEntryId: string, userId: string): Promise<MoodFactor[]> {
    // 1. Verificar se a moodEntryId pertence ao usuário
    await this.moodEntriesService.findOne(moodEntryId, userId); // Garante que a entrada existe e pertence ao usuário

    // 2. Buscar os fatores associados
    return this.moodFactorsRepository.find({
      where: { moodEntry: { id: moodEntryId } },
      relations: ['moodEntry'], // Opcional: carregar a relação se necessário
    });
  }

  async findOne(id: string, userId: string): Promise<MoodFactor> {
    const moodFactor = await this.moodFactorsRepository.findOne({
        where: { id },
        relations: ['moodEntry', 'moodEntry.user'], // Carrega a entrada e o usuário associado
     });

    if (!moodFactor) {
      throw new NotFoundException(`MoodFactor with ID "${id}" not found`);
    }

    // Verificar se o fator pertence ao usuário (através da moodEntry)
    if (moodFactor.moodEntry.user.id !== userId) {
        throw new ForbiddenException('You do not have permission to access this mood factor');
    }

    // Remover dados sensíveis do usuário antes de retornar, se necessário
    delete moodFactor.moodEntry.user;

    return moodFactor;
  }

  async update(id: string, updateMoodFactorDto: UpdateMoodFactorDto, user: User): Promise<MoodFactor> {
    // 1. Buscar o fator e verificar a propriedade (findOne já faz isso)
    const moodFactor = await this.findOne(id, user.id);

    // 2. Atualizar os campos permitidos
    // Não permite alterar moodEntryId na atualização
    const { moodEntryId, ...updateData } = updateMoodFactorDto;
    if (moodEntryId && moodEntryId !== moodFactor.moodEntry.id) {
        throw new ForbiddenException('Cannot change the mood entry association.');
    }

    this.moodFactorsRepository.merge(moodFactor, updateData);
    return this.moodFactorsRepository.save(moodFactor);
  }

  async remove(id: string, userId: string): Promise<void> {
    // 1. Buscar o fator e verificar a propriedade (findOne já faz isso)
    const moodFactor = await this.findOne(id, userId);

    // 2. Remover o fator
    const result = await this.moodFactorsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`MoodFactor with ID "${id}" not found`);
    }
  }
}