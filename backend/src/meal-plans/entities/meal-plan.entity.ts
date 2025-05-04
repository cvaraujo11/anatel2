import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  plan_date: string; // Ou Date

  @Column({ type: 'text', nullable: true })
  plan_details: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.mealPlans)
  user: User;
}