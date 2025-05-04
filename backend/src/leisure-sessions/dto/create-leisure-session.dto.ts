import { IsNotEmpty, IsString, IsDateString, IsOptional, IsInt, IsUUID } from 'class-validator';

export class CreateLeisureSessionDto {
  @IsNotEmpty()
  @IsDateString()
  start_time: string; // Usar string ISO 8601 para facilitar a validação

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsInt()
  duration?: number; // Pode ser calculado ou fornecido

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsUUID()
  leisureActivityId: string; // ID da atividade de lazer associada
}