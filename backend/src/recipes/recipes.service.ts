import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { IngredientsService } from '../ingredients/ingredients.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private recipeIngredientsRepository: Repository<RecipeIngredient>,
    private readonly ingredientsService: IngredientsService,
    private dataSource: DataSource, // Para transações
  ) {}

  async create(createRecipeDto: CreateRecipeDto, user: User): Promise<Recipe> {
    const { ingredients: ingredientData, ...recipeData } = createRecipeDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Criar a entidade Recipe básica
      const recipe = queryRunner.manager.create(Recipe, {
        ...recipeData,
        user: user, // Associar ao usuário autenticado
        userId: user.id,
      });
      const savedRecipe = await queryRunner.manager.save(recipe);

      // 2. Processar e criar/associar ingredientes
      if (ingredientData && ingredientData.length > 0) {
        const recipeIngredients: RecipeIngredient[] = [];
        for (const item of ingredientData) {
          const ingredient = await this.ingredientsService.findOrCreate(item.name, item.unit); // Usar o serviço de ingredientes
          const recipeIngredient = queryRunner.manager.create(RecipeIngredient, {
            recipe: savedRecipe,
            recipeId: savedRecipe.id,
            ingredient: ingredient,
            ingredientId: ingredient.id,
            quantity: item.quantity,
          });
          recipeIngredients.push(recipeIngredient);
        }
        await queryRunner.manager.save(recipeIngredients);
        // Atualizar a receita com os ingredientes associados (necessário para o retorno)
         savedRecipe.ingredients = recipeIngredients;
      }


      await queryRunner.commitTransaction();
      // Recarregar a receita com todas as relações após a transação
      // O eager loading em RecipeIngredient para Ingredient deve funcionar,
      // mas recarregar a Recipe garante que a relação Recipe -> RecipeIngredient esteja populada.
      return this.findOne(savedRecipe.id, user.id); // Retorna a receita completa

    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error("Erro ao criar receita:", err);
      throw new InternalServerErrorException('Falha ao criar a receita.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string): Promise<Recipe[]> {
    // Retorna apenas as receitas do usuário logado
    return this.recipesRepository.find({
      where: { userId },
      relations: ['ingredients', 'ingredients.ingredient'], // Carregar ingredientes e seus detalhes
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Recipe> {
    const recipe = await this.recipesRepository.findOne({
      where: { id, userId }, // Garante que o usuário só possa buscar suas próprias receitas
      relations: ['ingredients', 'ingredients.ingredient'], // Carregar ingredientes e seus detalhes
    });
    if (!recipe) {
      throw new NotFoundException(`Receita com ID "${id}" não encontrada.`);
    }
    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto, user: User): Promise<Recipe> {
    const { ingredients: ingredientData, ...recipeData } = updateRecipeDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 1. Buscar a receita existente e verificar permissão
        const recipe = await queryRunner.manager.findOne(Recipe, {
            where: { id, userId: user.id },
            relations: ['ingredients'], // Carregar ingredientes atuais para remoção
        });

        if (!recipe) {
            throw new NotFoundException(`Receita com ID "${id}" não encontrada ou você não tem permissão.`);
        }

        // 2. Atualizar dados básicos da receita (se houver)
        if (Object.keys(recipeData).length > 0) {
            queryRunner.manager.merge(Recipe, recipe, recipeData);
            await queryRunner.manager.save(Recipe, recipe); // Salva as alterações básicas
        }


      // 3. Atualizar ingredientes (se fornecidos)
      if (ingredientData) {
        // Remover ingredientes antigos associados a esta receita
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            await queryRunner.manager.remove(RecipeIngredient, recipe.ingredients);
        }


        // Adicionar novos ingredientes
        const newRecipeIngredients: RecipeIngredient[] = [];
        for (const item of ingredientData) {
          const ingredient = await this.ingredientsService.findOrCreate(item.name, item.unit);
          const recipeIngredient = queryRunner.manager.create(RecipeIngredient, {
            recipe: recipe,
            recipeId: recipe.id,
            ingredient: ingredient,
            ingredientId: ingredient.id,
            quantity: item.quantity,
          });
          newRecipeIngredients.push(recipeIngredient);
        }
        await queryRunner.manager.save(RecipeIngredient, newRecipeIngredients);
         // Atualizar a referência na entidade recipe para o retorno
         recipe.ingredients = newRecipeIngredients;
      }

      await queryRunner.commitTransaction();
       // Recarregar para garantir que todas as relações estejam atualizadas
       return this.findOne(id, user.id);

    } catch (err) {
      await queryRunner.rollbackTransaction();
       if (err instanceof NotFoundException || err instanceof ForbiddenException) {
           throw err;
       }
      console.error("Erro ao atualizar receita:", err);
      throw new InternalServerErrorException('Falha ao atualizar a receita.');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    // Buscar primeiro para garantir que pertence ao usuário
    const recipe = await this.findOne(id, userId); // findOne já lança NotFoundException se não encontrar ou não pertencer ao user

    // A remoção em cascata (definida na entidade Recipe para RecipeIngredient)
    // deve cuidar da remoção dos RecipeIngredients associados.
    const result = await this.recipesRepository.delete({ id, userId });

    if (result.affected === 0) {
      // Isso não deveria acontecer se findOne funcionou, mas é uma segurança extra.
      throw new NotFoundException(`Receita com ID "${id}" não encontrada.`);
    }
  }
}