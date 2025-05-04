import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSleepEntryDto {
  @IsNotEmpty()
  @IsDateString()
  sleepDate: string; // Usar string para data, pode ser convertido para Date no service se necessário

  @IsNotEmpty()
  @IsDateString()
  startTime: string; // Usar string para timestamp, pode ser convertido para Date no service

  @IsNotEmpty()
  @IsDateString()
  endTime: string; // Usar string para timestamp, pode ser convertido para Date no service

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  durationMinutes: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5) // Exemplo: escala de 1 a 5 para qualidade
  qualityScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}