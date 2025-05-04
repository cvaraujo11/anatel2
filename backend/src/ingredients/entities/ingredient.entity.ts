import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { RecipeIngredient } from '../../recipes/entities/recipe-ingredient.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ingredients')
@Unique(['name']) // Garante que o nome do ingrediente seja único
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true }) // Unidade pode ser opcional
  unit: string;

  @ManyToOne(() => User, user => user.ingredients)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToMany(() => RecipeIngredient, recipeIngredient => recipeIngredient.ingredient)
  recipeIngredients: RecipeIngredient[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}