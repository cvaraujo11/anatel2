import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FocusSession } from './entities/focus-session.entity';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class FocusSessionsService {
  constructor(
    @InjectRepository(FocusSession)
    private focusSessionsRepository: Repository<FocusSession>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createFocusSessionDto: CreateFocusSessionDto, user: User): Promise<FocusSession> {
    const project = await this.projectsRepository.findOne({ where: { id: createFocusSessionDto.projectId, user: { id: user.id } } });

    if (!project) {
      throw new NotFoundException(`Project with ID ${createFocusSessionDto.projectId} not found for this user.`);
    }

    const focusSession = this.focusSessionsRepository.create({
      ...createFocusSessionDto,
      user,
      project,
    });

    return this.focusSessionsRepository.save(focusSession);
  }

  async findAllForUser(userId: string): Promise<FocusSession[]> {
    return this.focusSessionsRepository.find({
      where: { user: { id: userId } },
      relations: ['project'],
    });
  }

  async findOneForUser(id: string, userId: string): Promise<FocusSession> {
    const focusSession = await this.focusSessionsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['project'],
    });

    if (!focusSession) {
      throw new NotFoundException(`Focus session with ID ${id} not found for this user.`);
    }

    return focusSession;
  }

  async update(id: string, updateFocusSessionDto: UpdateFocusSessionDto, userId: string): Promise<FocusSession> {
    const focusSession = await this.findOneForUser(id, userId); // Reuses the check for user ownership

    if (updateFocusSessionDto.projectId) {
       const project = await this.projectsRepository.findOne({ where: { id: updateFocusSessionDto.projectId, user: { id: userId } } });
       if (!project) {
         throw new NotFoundException(`Project with ID ${updateFocusSessionDto.projectId} not found for this user.`);
       }
       focusSession.project = project;
    }

    Object.assign(focusSession, updateFocusSessionDto);

    return this.focusSessionsRepository.save(focusSession);
  }

  async remove(id: string, userId: string): Promise<void> {
    const focusSession = await this.findOneForUser(id, userId); // Reuses the check for user ownership
    await this.focusSessionsRepository.remove(focusSession);
  }
}