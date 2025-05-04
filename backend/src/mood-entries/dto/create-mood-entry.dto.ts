import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, IsDateString } from 'class-validator';

export class CreateMoodEntryDto {
  @IsNotEmpty({ message: 'A pontuação do humor (moodScore) é obrigatória.' })
  @IsInt({ message: 'A pontuação do humor (moodScore) deve ser um número inteiro.' })
  @Min(1, { message: 'A pontuação do humor (moodScore) deve ser no mínimo 1.' })
  @Max(5, { message: 'A pontuação do humor (moodScore) deve ser no máximo 5.' }) // Supondo uma escala de 1 a 5 para o humor
  moodScore: number;

  @IsOptional()
  @IsString({ message: 'As notas (notes) devem ser um texto.' })
  notes?: string;

  @IsNotEmpty({ message: 'A data da entrada (entryDate) é obrigatória.' })
  @IsDateString({}, { message: 'A data da entrada (entryDate) deve estar no formato ISO 8601 (YYYY-MM-DD).' }) // Garante que seja uma string no formato ISO 8601 Date
  entryDate: string; // Usar string para data vinda do JSON
}