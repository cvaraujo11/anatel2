import { PartialType } from '@nestjs/mapped-types';
import { CreatePauseReminderDto } from './create-pause-reminder.dto';

export class UpdatePauseReminderDto extends PartialType(CreatePauseReminderDto) {}