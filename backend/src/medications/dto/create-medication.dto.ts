import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;
}