import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal)
    private mealsRepository: Repository<Meal>,
  ) {}

  async create(createMealDto: CreateMealDto, user: User): Promise<Meal> {
    const meal = this.mealsRepository.create({ ...createMealDto, user });
    return this.mealsRepository.save(meal);
  }

  async findAll(user: User): Promise<Meal[]> {
    return this.mealsRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: string, user: User): Promise<Meal> {
    const meal = await this.mealsRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!meal) {
      throw new NotFoundException(`Meal with ID "${id}" not found for this user.`);
    }
    return meal;
  }

  async update(id: string, updateMealDto: UpdateMealDto, user: User): Promise<Meal> {
    const meal = await this.findOne(id, user); // Ensures the meal belongs to the user
    this.mealsRepository.merge(meal, updateMealDto);
    return this.mealsRepository.save(meal);
  }

  async remove(id: string, user: User): Promise<void> {
    const result = await this.mealsRepository.delete({ id, user: { id: user.id } });
    if (result.affected === 0) {
      throw new NotFoundException(`Meal with ID "${id}" not found for this user.`);
    }
  }
}