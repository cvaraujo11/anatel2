import { IsBoolean, IsString } from 'class-validator';

export class CreateMedicationChecklistDto {
  @IsString()
  medication_name: string;

  @IsBoolean()
  taken: boolean;
}