import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from './create-recipe.dto';

// UpdateRecipeDto herda todas as validações de CreateRecipeDto,
// mas torna todos os campos opcionais.
export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}