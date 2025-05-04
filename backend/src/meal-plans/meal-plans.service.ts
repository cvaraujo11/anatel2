import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MealPlansService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
  ) {}

  async create(createMealPlanDto: CreateMealPlanDto, user: User): Promise<MealPlan> {
    const newMealPlan = this.mealPlanRepository.create({
      ...createMealPlanDto,
      user, // Associa o plano de refeição ao usuário autenticado
    });
    return this.mealPlanRepository.save(newMealPlan);
  }

  async findAll(user: User): Promise<MealPlan[]> {
    return this.mealPlanRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<MealPlan> {
    const mealPlan = await this.mealPlanRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!mealPlan) {
      throw new NotFoundException(`MealPlan with ID "${id}" not found`);
    }
    return mealPlan;
  }

  async update(id: string, updateMealPlanDto: UpdateMealPlanDto, user: User): Promise<MealPlan> {
    const mealPlan = await this.findOne(id, user); // Garante que o usuário só possa atualizar seus próprios planos
    const updatedMealPlan = this.mealPlanRepository.merge(mealPlan, updateMealPlanDto);
    return this.mealPlanRepository.save(updatedMealPlan);
  }

  async remove(id: string, user: User): Promise<void> {
    const mealPlan = await this.findOne(id, user); // Garante que o usuário só possa remover seus próprios planos
    await this.mealPlanRepository.remove(mealPlan);
  }
}