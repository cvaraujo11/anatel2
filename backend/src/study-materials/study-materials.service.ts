import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyMaterial } from './entities/study-material.entity';
import { CreateStudyMaterialDto } from './dto/create-study-material.dto';
import { UpdateStudyMaterialDto } from './dto/update-study-material.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudyMaterialsService {
  constructor(
    @InjectRepository(StudyMaterial)
    private studyMaterialRepository: Repository<StudyMaterial>,
  ) {}

  async create(createStudyMaterialDto: CreateStudyMaterialDto, user: User): Promise<StudyMaterial> {
    const studyMaterial = this.studyMaterialRepository.create({
      ...createStudyMaterialDto,
      user,
    });
    return this.studyMaterialRepository.save(studyMaterial);
  }

  async findAll(user: User): Promise<StudyMaterial[]> {
    return this.studyMaterialRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: number, user: User): Promise<StudyMaterial> {
    const studyMaterial = await this.studyMaterialRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!studyMaterial) {
      throw new NotFoundException(`Study material with ID "${id}" not found for this user.`);
    }
    return studyMaterial;
  }

  async update(id: number, updateStudyMaterialDto: UpdateStudyMaterialDto, user: User): Promise<StudyMaterial> {
    const studyMaterial = await this.findOne(id, user); // Ensures the material belongs to the user
    this.studyMaterialRepository.merge(studyMaterial, updateStudyMaterialDto);
    return this.studyMaterialRepository.save(studyMaterial);
  }

  async remove(id: number, user: User): Promise<void> {
    const studyMaterial = await this.findOne(id, user); // Ensures the material belongs to the user
    await this.studyMaterialRepository.remove(studyMaterial);
  }
}