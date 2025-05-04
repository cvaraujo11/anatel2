import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string; // e.g., grams, ml, units
}