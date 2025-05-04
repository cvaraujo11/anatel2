import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateStudyMaterialDto {
  @IsString()
  title: string;

  @IsString()
  type: string; // e.g., 'pdf', 'video', 'link'

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  description?: string;
}