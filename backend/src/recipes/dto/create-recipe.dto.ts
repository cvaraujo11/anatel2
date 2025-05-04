import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsUrl, IsArray, ValidateNested, ArrayMinSize, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class IngredientDto {
  @IsNotEmpty({ message: 'O nome do ingrediente não pode estar vazio.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'A quantidade do ingrediente não pode estar vazia.' })
  @IsString()
  quantity: string; // Ex: "2 xícaras", "100g"

  @IsOptional()
  @IsString()
  unit?: string; // Ex: "ml", "g", "unidade" - Opcional, pode estar na quantidade
}

export class CreateRecipeDto {
  @IsNotEmpty({ message: 'O título da receita não pode estar vazio.' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cookTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL da imagem inválida.' })
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1) // Se fornecer ingredientes, deve ter pelo menos um
  @Type(() => IngredientDto)
  ingredients?: IngredientDto[];
}