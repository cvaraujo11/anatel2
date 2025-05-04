import { PartialType } from '@nestjs/mapped-types';
import { CreateHydrationReminderDto } from './create-hydration-reminder.dto';

export class UpdateHydrationReminderDto extends PartialType(CreateHydrationReminderDto) {}