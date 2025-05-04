import { IsNotEmpty, IsString, IsUUID, MaxLength, IsOptional } from 'class-validator';

export class CreateMoodFactorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  factor_name: string;

  @IsOptional()
  @IsString()
  factor_details?: string;

  @IsNotEmpty()
  @IsUUID()
  moodEntryId: string; // ID da entrada de humor à qual este fator pertence
}