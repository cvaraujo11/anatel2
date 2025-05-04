import { PartialType } from '@nestjs/mapped-types';
import { CreatePriorityDto } from './create-priority.dto';
import { IsOptional, IsString, IsNotEmpty, IsInt, Min, IsBoolean } from 'class-validator';

// PartialType makes all properties optional, but we can override if needed
// For update, we might want to allow updating individual fields without requiring others.
export class UpdatePriorityDto extends PartialType(CreatePriorityDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority_order?: number;

  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}