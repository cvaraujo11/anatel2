import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Competition } from '../../competitions/entities/competition.entity';
import { SimulationHistory } from '../../simulation-history/entities/simulation-history.entity';

@Entity('simulations')
export class Simulation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  score: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.simulations)
  user: User;

  @ManyToOne(() => Competition, competition => competition.simulations)
  competition: Competition;

  @OneToMany(() => SimulationHistory, simulationHistory => simulationHistory.simulation)
  simulationHistory: SimulationHistory[];
}