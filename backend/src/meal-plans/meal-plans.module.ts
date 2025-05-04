import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlansService } from './meal-plans.service';
import { MealPlansController } from './meal-plans.controller';
import { MealPlan } from './entities/meal-plan.entity';
import { AuthModule } from '../auth/auth.module'; // Importar AuthModule se JwtAuthGuard for usado globalmente ou aqui

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlan]),
    AuthModule, // Incluir se necessário para JwtAuthGuard
  ],
  controllers: [MealPlansController],
  providers: [MealPlansService],
})
export class MealPlansModule {}