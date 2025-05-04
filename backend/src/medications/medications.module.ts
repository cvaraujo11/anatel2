import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';
import { Medication } from './entities/medication.entity';
import { AuthModule } from '../auth/auth.module'; // Importar AuthModule se necessário para Guards

@Module({
  imports: [
    TypeOrmModule.forFeature([Medication]),
    AuthModule, // Incluir se JwtAuthGuard depender de provedores do AuthModule
  ],
  controllers: [MedicationsController],
  providers: [MedicationsService],
})
export class MedicationsModule {}