import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeisureActivity } from '../../leisure-activities/entities/leisure-activity.entity';

@Entity('leisure_sessions')
export class LeisureSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.leisureSessions)
  user: User;

  @ManyToOne(() => LeisureActivity, leisureActivity => leisureActivity.leisureSessions)
  leisureActivity: LeisureActivity;
}