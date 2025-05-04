import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Usando '!' para indicar que será inicializado pelo TypeORM

  @ManyToOne(() => Recipe, recipe => recipe.ingredients, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @Column()
  recipeId!: string; // Chave estrangeira explícita

  @ManyToOne(() => Ingredient, ingredient => ingredient.recipeIngredients, { nullable: false, eager: true, onDelete: 'RESTRICT' }) // Eager para carregar o ingrediente, RESTRICT para não deletar ingrediente se estiver em uso
  @JoinColumn({ name: 'ingredient_id' })
  ingredient!: Ingredient;

  @Column()
  ingredientId!: string; // Chave estrangeira explícita

  @Column({ type: 'varchar', length: 100 }) // Ex: "2 xícaras", "100g", "a gosto"
  quantity!: string;
}