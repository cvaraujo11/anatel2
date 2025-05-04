import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming JwtAuthGuard is in auth folder
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  create(@Body() createMealDto: CreateMealDto, @Req() req: Request) {
    const user = req.user as User;
    return this.mealsService.create(createMealDto, user);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as User;
    return this.mealsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    return this.mealsService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMealDto: UpdateMealDto, @Req() req: Request) {
    const user = req.user as User;
    return this.mealsService.update(id, updateMealDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    return this.mealsService.remove(id, user);
  }
}