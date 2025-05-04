import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateRestSuggestionDto } from './create-rest-suggestion.dto';

export class UpdateRestSuggestionDto extends PartialType(CreateRestSuggestionDto) {
  @IsOptional()
  @IsBoolean({ message: 'O campo "is_taken" deve ser um booleano.' })
  is_taken?: boolean;
}