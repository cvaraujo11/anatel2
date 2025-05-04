import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('study_sessions')
export class StudySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.studySessions, { onDelete: 'CASCADE' }) // Adiciona onDelete CASCADE
  @JoinColumn({ name: 'user_id' }) // Especifica a coluna de junção
  user: User; // Relação ManyToOne com User

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ name: 'start_time', type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp with time zone' })
  endTime: Date;

  @Column({ type: 'integer' }) // Duração em minutos ou segundos? Assumindo minutos.
  duration: number;

  @Column({ type: 'text', nullable: true }) // Notas podem ser opcionais
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  // Não há 'updated_at' no esquema, então não incluímos aqui.
}