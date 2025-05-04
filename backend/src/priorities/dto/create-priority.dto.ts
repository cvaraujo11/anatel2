import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreatePriorityDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  priority_order: number;

  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}