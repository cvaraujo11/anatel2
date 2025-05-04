import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeisureSession } from '../../leisure-sessions/entities/leisure-session.entity';

@Entity('leisure_activities')
export class LeisureActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.leisureActivities)
  user: User;

  @OneToMany(() => LeisureSession, leisureSession => leisureSession.leisureActivity)
  leisureSessions: LeisureSession[];
}