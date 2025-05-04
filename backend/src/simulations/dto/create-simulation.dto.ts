import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateSimulationDto {
  @IsNotEmpty()
  @IsNumber()
  competitionId: number;

  @IsOptional()
  @IsDateString()
  start_time?: Date;

  @IsOptional()
  @IsDateString()
  end_time?: Date;

  @IsOptional()
  @IsNumber()
  score?: number;
}