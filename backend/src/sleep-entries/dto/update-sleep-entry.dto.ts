import { PartialType } from '@nestjs/mapped-types';
import { CreateSleepEntryDto } from './create-sleep-entry.dto';

export class UpdateSleepEntryDto extends PartialType(CreateSleepEntryDto) {}