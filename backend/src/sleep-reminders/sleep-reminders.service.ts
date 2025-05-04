import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSleepReminderDto } from './dto/create-sleep-reminder.dto';
import { UpdateSleepReminderDto } from './dto/update-sleep-reminder.dto';
import { SleepReminder } from './entities/sleep-reminder.entity';
import { User } from '../users/entities/user.entity'; // Import User entity if needed for relations

@Injectable()
export class SleepRemindersService {
  constructor(
    @InjectRepository(SleepReminder)
    private readonly sleepReminderRepository: Repository<SleepReminder>,
  ) {}

  async create(createSleepReminderDto: CreateSleepReminderDto, userId: string): Promise<SleepReminder> {
    const newReminder = this.sleepReminderRepository.create({
      ...createSleepReminderDto,
      bedtime_reminder: new Date(createSleepReminderDto.bedtime_reminder), // Convert string to Date
      wake_up_reminder: new Date(createSleepReminderDto.wake_up_reminder), // Convert string to Date
      user: { id: userId } as User, // Associate with the user
    });
    return this.sleepReminderRepository.save(newReminder);
  }

  async findAll(userId: string): Promise<SleepReminder[]> {
    return this.sleepReminderRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' }, // Optional: order by creation date
    });
  }

  async findOne(id: string, userId: string): Promise<SleepReminder> {
    const reminder = await this.sleepReminderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!reminder) {
      throw new NotFoundException(`Lembrete de sono com ID "${id}" não encontrado.`);
    }
    return reminder;
  }

  async update(id: string, updateSleepReminderDto: UpdateSleepReminderDto, userId: string): Promise<SleepReminder> {
    const reminder = await this.findOne(id, userId); // findOne already checks ownership and throws NotFoundException

    // Prepare update data, converting date strings to Date objects
    const updateData: Partial<SleepReminder> = {};
    if (updateSleepReminderDto.bedtime_reminder !== undefined) {
      updateData.bedtime_reminder = new Date(updateSleepReminderDto.bedtime_reminder);
    }
    if (updateSleepReminderDto.wake_up_reminder !== undefined) {
      updateData.wake_up_reminder = new Date(updateSleepReminderDto.wake_up_reminder);
    }
    if (updateSleepReminderDto.active !== undefined) {
      updateData.active = updateSleepReminderDto.active;
    }

    // Merge existing entity with update data
    this.sleepReminderRepository.merge(reminder, updateData);

    return this.sleepReminderRepository.save(reminder);
  }

  async remove(id: string, userId: string): Promise<void> {
    const reminder = await this.findOne(id, userId); // findOne checks ownership and throws NotFoundException
    const result = await this.sleepReminderRepository.delete(id);

    if (result.affected === 0) {
      // This case should ideally not happen if findOne succeeded, but good for robustness
      throw new NotFoundException(`Lembrete de sono com ID "${id}" não encontrado para exclusão.`);
    }
  }
}