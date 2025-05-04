import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepEntriesService } from './sleep-entries.service';
import { SleepEntriesController } from './sleep-entries.controller';
import { SleepEntry } from './entities/sleep-entry.entity';
import { AuthModule } from '../auth/auth.module'; // Importa o AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([SleepEntry]), // Registra a entidade SleepEntry
    AuthModule, // Importa AuthModule para disponibilizar JwtAuthGuard e suas dependências
  ],
  controllers: [SleepEntriesController],
  providers: [SleepEntriesService],
})
export class SleepEntriesModule {}