import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeisureActivityDto {
  @IsNotEmpty({ message: 'O nome da atividade não pode estar vazio.' })
  @IsString({ message: 'O nome da atividade deve ser uma string.' })
  @MaxLength(100, { message: 'O nome da atividade não pode ter mais que 100 caracteres.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string.' })
  @MaxLength(500, { message: 'A descrição não pode ter mais que 500 caracteres.' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser uma string.' })
  @MaxLength(50, { message: 'A categoria não pode ter mais que 50 caracteres.' })
  category?: string;
}