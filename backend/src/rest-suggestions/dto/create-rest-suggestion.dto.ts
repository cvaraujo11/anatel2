import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateRestSuggestionDto {
  @IsString({ message: 'O texto da sugestão deve ser uma string.' })
  @IsNotEmpty({ message: 'O texto da sugestão não pode estar vazio.' })
  @MaxLength(500, { message: 'O texto da sugestão deve ter no máximo 500 caracteres.' })
  suggestion_text: string;

  @IsOptional()
  @IsDateString({}, { message: 'A data da sugestão deve estar no formato ISO 8601.' })
  suggestion_date?: string; // A data pode ser opcional na criação, talvez default para hoje?
}