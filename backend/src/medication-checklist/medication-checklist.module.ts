import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationChecklistService } from './medication-checklist.service';
import { MedicationChecklistController } from './medication-checklist.controller';
import { MedicationChecklist } from './entities/medication-checklist.entity';
import { AuthModule } from '../auth/auth.module'; // Assumindo o caminho do seu AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([MedicationChecklist]), AuthModule],
  controllers: [MedicationChecklistController],
  providers: [MedicationChecklistService],
})
export class MedicationChecklistModule {}