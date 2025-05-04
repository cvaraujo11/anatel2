import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HydrationReminder } from './entities/hydration-reminder.entity';
import { CreateHydrationReminderDto } from './dto/create-hydration-reminder.dto';
import { UpdateHydrationReminderDto } from './dto/update-hydration-reminder.dto';
import { User } from '../users/entities/user.entity'; // Import User entity

@Injectable()
export class HydrationRemindersService {
  constructor(
    @InjectRepository(HydrationReminder)
    private hydrationReminderRepository: Repository<HydrationReminder>,
  ) {}

  async create(createHydrationReminderDto: CreateHydrationReminderDto, user: User): Promise<HydrationReminder> {
    const newReminder = this.hydrationReminderRepository.create({
      ...createHydrationReminderDto,
      user: user, // Associate with the authenticated user
    });
    return this.hydrationReminderRepository.save(newReminder);
  }

  async findAll(user: User): Promise<HydrationReminder[]> {
    return this.hydrationReminderRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<HydrationReminder> {
    const reminder = await this.hydrationReminderRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!reminder) {
      throw new NotFoundException(`Hydration reminder with ID "${id}" not found`);
    }
    return reminder;
  }

  async update(id: string, updateHydrationReminderDto: UpdateHydrationReminderDto, user: User): Promise<HydrationReminder> {
    const reminder = await this.findOne(id, user); // Ensures the reminder exists and belongs to the user

    // Merge the existing reminder with the update DTO
    const updatedReminder = this.hydrationReminderRepository.merge(reminder, updateHydrationReminderDto);

    return this.hydrationReminderRepository.save(updatedReminder);
  }

  async remove(id: string, user: User): Promise<void> {
    const reminder = await this.findOne(id, user); // Ensures the reminder exists and belongs to the user
    const result = await this.hydrationReminderRepository.delete(id);

    if (result.affected === 0) {
      // This case should ideally not happen due to findOne check, but good for robustness
      throw new NotFoundException(`Hydration reminder with ID "${id}" not found`);
    }
  }
}