import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicationChecklistDto } from './create-medication-checklist.dto';

export class UpdateMedicationChecklistDto extends PartialType(CreateMedicationChecklistDto) {}