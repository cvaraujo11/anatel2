import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { Meal } from './entities/meal.entity';
import { User } from '../users/entities/user.entity'; // Import User entity

@Module({
  imports: [TypeOrmModule.forFeature([Meal, User])], // Include User entity here
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule {}