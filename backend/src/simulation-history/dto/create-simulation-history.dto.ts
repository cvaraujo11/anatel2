import { IsNotEmpty, IsUUID, IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateSimulationHistoryDto {
  @IsNotEmpty()
  @IsUUID()
  simulationId: string;

  @IsNotEmpty()
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsString()
  userAnswer?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}