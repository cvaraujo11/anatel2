import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('rest_suggestions')
export class RestSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  suggestion_text: string;

  @Column({ default: false })
  is_taken: boolean;

  @Column({ type: 'date' })
  suggestion_date: string; // Ou Date

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.restSuggestions)
  user: User;
}