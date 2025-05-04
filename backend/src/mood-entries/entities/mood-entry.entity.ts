import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MoodFactor } from '../../mood-factors/entities/mood-factor.entity';

@Entity('mood_entries')
export class MoodEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  entry_date: string; // Ou Date

  @Column()
  mood_score: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.moodEntries)
  user: User;

  @OneToMany(() => MoodFactor, moodFactor => moodFactor.moodEntry)
  moodFactors: MoodFactor[];
}