import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Simulation } from '../../simulations/entities/simulation.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('simulation_history')
export class SimulationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  user_answer: string;

  @Column()
  is_correct: boolean;

  @CreateDateColumn()
  answered_at: Date;

  @ManyToOne(() => Simulation, simulation => simulation.simulationHistory)
  simulation: Simulation;

  @ManyToOne(() => Question, question => question.simulationHistory)
  question: Question;
}