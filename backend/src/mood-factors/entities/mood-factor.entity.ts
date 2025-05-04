import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MoodEntry } from '../../mood-entries/entities/mood-entry.entity';

@Entity('mood_factors')
export class MoodFactor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  factor_name: string;

  @Column({ type: 'text', nullable: true })
  factor_details: string;

  @ManyToOne(() => MoodEntry, moodEntry => moodEntry.moodFactors)
  moodEntry: MoodEntry;
}