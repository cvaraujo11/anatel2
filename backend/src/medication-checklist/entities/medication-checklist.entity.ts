import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('medication_checklist')
export class MedicationChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medication_name: string;

  @Column({ default: false })
  taken: boolean;

  @Column({ type: 'date' })
  checklist_date: string; // Ou Date

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.medicationChecklists)
  user: User;
}