import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pause_reminders')
export class PauseReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  interval_minutes: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.pauseReminders)
  user: User;
}