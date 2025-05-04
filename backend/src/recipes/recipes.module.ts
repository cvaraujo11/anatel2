import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { AuthModule } from '../auth/auth.module'; // Importar AuthModule para usar guards

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, RecipeIngredient]),
    IngredientsModule, // Importar para acessar IngredientsService
    AuthModule, // Importar para usar JwtAuthGuard
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}