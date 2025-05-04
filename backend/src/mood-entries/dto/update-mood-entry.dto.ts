import { PartialType } from '@nestjs/mapped-types';
import { CreateMoodEntryDto } from './create-mood-entry.dto';

export class UpdateMoodEntryDto extends PartialType(CreateMoodEntryDto) {}