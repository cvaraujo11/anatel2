import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateStudySessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string; // Usar string ISO 8601 para facilitar a entrada via API

  @IsDateString()
  @IsNotEmpty()
  endTime: string; // Usar string ISO 8601

  @IsInt()
  @Min(1) // Duração deve ser pelo menos 1 (minuto, segundo?)
  duration: number;

  @IsString()
  @IsOptional()
  notes?: string;

  // userId será obtido do usuário autenticado (JWT), não do DTO
}