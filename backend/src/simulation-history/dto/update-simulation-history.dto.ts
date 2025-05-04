import { PartialType } from '@nestjs/mapped-types';
import { CreateSimulationHistoryDto } from './create-simulation-history.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateSimulationHistoryDto extends PartialType(CreateSimulationHistoryDto) {
  @IsOptional()
  @IsString()
  userAnswer?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}