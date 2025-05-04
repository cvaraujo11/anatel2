import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interest } from './entities/interest.entity';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private interestsRepository: Repository<Interest>,
  ) {}

  async create(createInterestDto: CreateInterestDto, user: User): Promise<Interest> {
    const interest = this.interestsRepository.create({
      ...createInterestDto,
      user,
    });
    return this.interestsRepository.save(interest);
  }

  async findAll(userId: string): Promise<Interest[]> {
    return this.interestsRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: string, userId: string): Promise<Interest> {
    const interest = await this.interestsRepository.findOne({ where: { id, user: { id: userId } } });
    if (!interest) {
      throw new NotFoundException(`Interest with ID "${id}" not found for this user.`);
    }
    return interest;
  }

  async update(id: string, updateInterestDto: UpdateInterestDto, userId: string): Promise<Interest> {
    const interest = await this.findOne(id, userId); // Check if interest exists and belongs to the user

    // Apply updates from DTO
    Object.assign(interest, updateInterestDto);

    return this.interestsRepository.save(interest);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.interestsRepository.delete({ id, user: { id: userId } });
    if (result.affected === 0) {
      throw new NotFoundException(`Interest with ID "${id}" not found for this user.`);
    }
  }
}