import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMedicationChecklistDto } from './dto/create-medication-checklist.dto';
import { UpdateMedicationChecklistDto } from './dto/update-medication-checklist.dto';
import { MedicationChecklist } from './entities/medication-checklist.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MedicationChecklistService {
  constructor(
    @InjectRepository(MedicationChecklist)
    private medicationChecklistRepository: Repository<MedicationChecklist>,
  ) {}

  async create(createMedicationChecklistDto: CreateMedicationChecklistDto, user: User): Promise<MedicationChecklist> {
    const medicationChecklist = this.medicationChecklistRepository.create({
      ...createMedicationChecklistDto,
      user: user,
    });
    return this.medicationChecklistRepository.save(medicationChecklist);
  }

  async findAllForUser(userId: string): Promise<MedicationChecklist[]> {
    return this.medicationChecklistRepository.find({ where: { user: { id: userId } } });
  }

  async findOneForUser(id: string, userId: string): Promise<MedicationChecklist> {
    const medicationChecklist = await this.medicationChecklistRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!medicationChecklist) {
      throw new NotFoundException(`Medication checklist with ID "${id}" not found for this user.`);
    }
    return medicationChecklist;
  }

  async update(id: string, updateMedicationChecklistDto: UpdateMedicationChecklistDto, userId: string): Promise<MedicationChecklist> {
    const medicationChecklist = await this.findOneForUser(id, userId); // Ensures ownership
    this.medicationChecklistRepository.merge(medicationChecklist, updateMedicationChecklistDto);
    return this.medicationChecklistRepository.save(medicationChecklist);
  }

  async remove(id: string, userId: string): Promise<void> {
    const medicationChecklist = await this.findOneForUser(id, userId); // Ensures ownership
    await this.medicationChecklistRepository.remove(medicationChecklist);
  }
}