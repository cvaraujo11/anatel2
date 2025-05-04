import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Adicionado '!'

  @Column({ type: 'varchar', length: 255 })
  title!: string; // Adicionado '!'

  @Column({ type: 'text', nullable: true })
  description!: string; // Adicionado '!'

  @Column({ type: 'text', nullable: true })
  instructions!: string; // Adicionado '!'

  @Column({ type: 'int', nullable: true })
  prepTimeMinutes!: number; // Adicionado '!'

  @Column({ type: 'int', nullable: true })
  cookTimeMinutes!: number; // Adicionado '!'

  @Column({ type: 'int', nullable: true })
  servings!: number; // Adicionado '!'

  @Column({ type: 'varchar', length: 255, nullable: true })
  category!: string; // Adicionado '!'

  @Column({ type: 'varchar', length: 2048, nullable: true }) // URL da imagem
  imageUrl!: string; // Adicionado '!'

  @ManyToOne(() => User, user => user.recipes, { nullable: false, onDelete: 'CASCADE' }) // Se o usuário for deletado, suas receitas também serão.
  @JoinColumn({ name: 'user_id' })
  user!: User; // Adicionado '!'

  @Column()
  userId!: string; // Adicionado '!'

  @OneToMany(() => RecipeIngredient, recipeIngredient => recipeIngredient.recipe, { cascade: true, eager: true }) // Cascade para salvar/atualizar/remover ingredientes junto com a receita. Eager para carregar ingredientes automaticamente.
  ingredients!: RecipeIngredient[]; // Adicionado '!'

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date; // Adicionado '!'

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date; // Adicionado '!'
}