import { IsDate, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHydrationReminderDto {
  @IsDate()
  @Type(() => Date) // Ensure transformation from string if needed
  reminder_time: Date;

  @IsInt()
  @Min(1) // Volume must be at least 1 ml
  volume_ml: number;

  @IsBoolean()
  @IsOptional() // Active is optional, defaults to true in entity
  active?: boolean;
}