import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './entities/competition.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private competitionsRepository: Repository<Competition>,
  ) {}

  async create(createCompetitionDto: CreateCompetitionDto, user: User): Promise<Competition> {
    const competition = this.competitionsRepository.create({
      ...createCompetitionDto,
      user: user, // Associate with the authenticated user
    });
    return this.competitionsRepository.save(competition);
  }

  async findAll(user: User): Promise<Competition[]> {
    // Find competitions associated with the authenticated user
    return this.competitionsRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<Competition> {
    // Find a specific competition for the authenticated user
    const competition = await this.competitionsRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!competition) {
      throw new NotFoundException(`Competition with ID "${id}" not found for this user.`);
    }
    return competition;
  }

  async update(id: string, updateCompetitionDto: UpdateCompetitionDto, user: User): Promise<Competition> {
    // Find and update a specific competition for the authenticated user
    const competition = await this.findOne(id, user); // Use findOne to ensure ownership
    this.competitionsRepository.merge(competition, updateCompetitionDto);
    return this.competitionsRepository.save(competition);
  }

  async remove(id: string, user: User): Promise<void> {
    // Find and remove a specific competition for the authenticated user
    const competition = await this.findOne(id, user); // Use findOne to ensure ownership
    await this.competitionsRepository.remove(competition);
  }
}