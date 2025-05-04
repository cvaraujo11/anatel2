import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
// No longer need the full User entity here
// import { User } from '../users/entities/user.entity';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
  ) {}

  // Changed 'user: User' to 'userId: string'
  async create(createMedicationDto: CreateMedicationDto, userId: string): Promise<Medication> {
    const newMedication = this.medicationsRepository.create({
      ...createMedicationDto,
      user: { id: userId }, // Associate using only the user ID
    });
    return this.medicationsRepository.save(newMedication);
  }

  // Changed 'user: User' to 'userId: string'
  async findAll(userId: string): Promise<Medication[]> {
    return this.medicationsRepository.find({ where: { user: { id: userId } } });
  }

  // Changed 'user: User' to 'userId: string'
  async findOne(id: string, userId: string): Promise<Medication> {
    const medication = await this.medicationsRepository.findOne({ where: { id, user: { id: userId } } });
    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found for this user.`);
    }
    return medication;
  }

  // Changed 'user: User' to 'userId: string'
  async update(id: string, updateMedicationDto: UpdateMedicationDto, userId: string): Promise<Medication> {
    // Pass userId to findOne
    const medication = await this.findOne(id, userId); // Ensure the medication exists and belongs to the user
    // No need to merge user again as it's already associated and findOne confirms ownership
    const updatedMedication = this.medicationsRepository.merge(medication, updateMedicationDto);
    return this.medicationsRepository.save(updatedMedication);
  }

  // Changed 'user: User' to 'userId: string'
  async remove(id: string, userId: string): Promise<void> {
    // Use userId in the delete condition
    const result = await this.medicationsRepository.delete({ id, user: { id: userId } });
    if (result.affected === 0) {
      throw new NotFoundException(`Medication with ID ${id} not found for this user.`);
    }
  }
}