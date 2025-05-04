import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateMealPlanDto {
  @IsDateString()
  @IsNotEmpty()
  plan_date: string; // Ou Date, dependendo da validação preferida

  @IsString()
  @IsOptional()
  plan_details?: string;
}