import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Competition } from '../../competitions/entities/competition.entity';
import { SimulationHistory } from '../../simulation-history/entities/simulation-history.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'text' })
  answer_text: string;

  @Column()
  subject: string;

  @Column({ nullable: true })
  topic: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Competition, competition => competition.questions)
  competition: Competition;

  @OneToMany(() => SimulationHistory, simulationHistory => simulationHistory.question)
  simulationHistory: SimulationHistory[];
}