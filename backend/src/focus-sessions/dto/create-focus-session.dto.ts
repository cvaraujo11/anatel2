import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFocusSessionDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  duration: number; // duration in minutes

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  projectId: string;
}