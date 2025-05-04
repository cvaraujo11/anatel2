import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { Priority } from './entities/priority.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PrioritiesService {
  constructor(
    @InjectRepository(Priority)
    private prioritiesRepository: Repository<Priority>,
  ) {}

  async create(createPriorityDto: CreatePriorityDto, user: User): Promise<Priority> {
    const newPriority = this.prioritiesRepository.create({
      ...createPriorityDto,
      user, // Associate the priority with the authenticated user
    });
    return this.prioritiesRepository.save(newPriority);
  }

  async findAll(user: User): Promise<Priority[]> {
    return this.prioritiesRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<Priority> {
    const priority = await this.prioritiesRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!priority) {
      throw new NotFoundException(`Priority with ID "${id}" not found`);
    }
    return priority;
  }

  async update(id: string, updatePriorityDto: UpdatePriorityDto, user: User): Promise<Priority> {
    const priority = await this.findOne(id, user); // Ensure the priority exists and belongs to the user
    const updatedPriority = this.prioritiesRepository.merge(priority, updatePriorityDto);
    return this.prioritiesRepository.save(updatedPriority);
  }

  async remove(id: string, user: User): Promise<void> {
    const result = await this.prioritiesRepository.delete({ id, user: { id: user.id } });
    if (result.affected === 0) {
      throw new NotFoundException(`Priority with ID "${id}" not found`);
    }
  }
}