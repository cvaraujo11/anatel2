import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePauseReminderDto } from './dto/create-pause-reminder.dto';
import { UpdatePauseReminderDto } from './dto/update-pause-reminder.dto';
import { PauseReminder } from './entities/pause-reminder.entity';
import { User } from '../users/entities/user.entity'; // Caminho corrigido

@Injectable()
export class PauseRemindersService {
  constructor(
    @InjectRepository(PauseReminder)
    private readonly pauseReminderRepository: Repository<PauseReminder>,
    // Não injetamos UserRepository aqui, o userId virá do request/token
  ) {}

  // userId agora é estritamente string
  async create(createPauseReminderDto: CreatePauseReminderDto, userId: string): Promise<PauseReminder> {
    const newReminder = this.pauseReminderRepository.create({
      ...createPauseReminderDto,
      user: { id: userId } as User, // Associa o lembrete ao usuário (garante o tipo)
    });
    return this.pauseReminderRepository.save(newReminder);
  }

  // userId agora é estritamente string
  async findAll(userId: string): Promise<PauseReminder[]> {
    return this.pauseReminderRepository.find({
      where: { user: { id: userId } },
    });
  }

  // ID do lembrete e userId são strings
  async findOne(id: string, userId: string): Promise<PauseReminder> {
    const reminder = await this.pauseReminderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!reminder) {
      throw new NotFoundException(`Pause reminder with ID "${id}" not found or does not belong to the user.`);
    }
    return reminder;
  }

  // ID do lembrete e userId são strings
  async update(id: string, updatePauseReminderDto: UpdatePauseReminderDto, userId: string): Promise<PauseReminder> {
    const reminder = await this.findOne(id, userId); // findOne já está correto
    this.pauseReminderRepository.merge(reminder, updatePauseReminderDto);
    return this.pauseReminderRepository.save(reminder);
  }

  // ID do lembrete e userId são strings
  async remove(id: string, userId: string): Promise<void> {
    const reminder = await this.findOne(id, userId); // findOne já está correto
    const result = await this.pauseReminderRepository.delete(reminder.id);

    if (result.affected === 0) {
      throw new NotFoundException(`Pause reminder with ID "${id}" could not be deleted.`);
    }
  }
}