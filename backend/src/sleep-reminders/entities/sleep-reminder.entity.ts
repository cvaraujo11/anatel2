import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('sleep_reminders')
export class SleepReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: true })
  bedtime_reminder: Date;

  @Column({ type: 'timestamp', nullable: true })
  wake_up_reminder: Date;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.sleepReminders)
  user: User;
}