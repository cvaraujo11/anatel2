import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateMealDto {
  @IsString()
  type: string;

  @IsDateString()
  time: Date;

  @IsOptional()
  @IsString()
  description?: string;
}