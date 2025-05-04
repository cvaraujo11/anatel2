import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  dosage: string;

  @Column({ nullable: true })
  frequency: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.medications)
  user: User;
}