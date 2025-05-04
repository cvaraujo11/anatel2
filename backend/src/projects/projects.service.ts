import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    const project = this.projectsRepository.create({ ...createProjectDto, user });
    return this.projectsRepository.save(project);
  }

  async findAll(user: User): Promise<Project[]> {
    return this.projectsRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found for this user.`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<Project> {
    const project = await this.findOne(id, user); // Ensure project belongs to the user
    this.projectsRepository.merge(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, user: User): Promise<void> {
    const project = await this.findOne(id, user); // Ensure project belongs to the user
    await this.projectsRepository.remove(project);
  }
}