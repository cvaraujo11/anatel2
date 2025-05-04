import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';
import { Simulation } from '../../simulations/entities/simulation.entity';

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  start_date: string; // Ou Date

  @Column({ type: 'date', nullable: true })
  end_date: string; // Ou Date

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.competitions)
  user: User;

  @OneToMany(() => Question, question => question.competition)
  questions: Question[];

  @OneToMany(() => Simulation, simulation => simulation.competition)
  simulations: Simulation[];
}