import { PartialType } from '@nestjs/mapped-types';
import { CreateSleepReminderDto } from './create-sleep-reminder.dto';

export class UpdateSleepReminderDto extends PartialType(CreateSleepReminderDto) {}