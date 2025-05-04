import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto, user: User): Promise<Ingredient> {
    const ingredient = this.ingredientsRepository.create({
      ...createIngredientDto,
      user,
    });
    return this.ingredientsRepository.save(ingredient);
  }

  async findAll(user: User): Promise<Ingredient[]> {
    return this.ingredientsRepository.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: number, user: User): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found for this user`);
    }
    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto, user: User): Promise<Ingredient> {
    const ingredient = await this.findOne(id, user); // Ensure ingredient belongs to the user
    this.ingredientsRepository.merge(ingredient, updateIngredientDto);
    return this.ingredientsRepository.save(ingredient);
  }

  async remove(id: number, user: User): Promise<void> {
    const ingredient = await this.findOne(id, user); // Ensure ingredient belongs to the user
    await this.ingredientsRepository.remove(ingredient);
  }
}