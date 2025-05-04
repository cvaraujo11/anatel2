import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FocusSession } from '../../focus-sessions/entities/focus-session.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  start_date: string; // Ou Date

  @Column({ type: 'date', nullable: true })
  end_date: string; // Ou Date

  @Column({ nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.projects)
  user: User;

  @OneToMany(() => FocusSession, focusSession => focusSession.project)
  focusSessions: FocusSession[];
}