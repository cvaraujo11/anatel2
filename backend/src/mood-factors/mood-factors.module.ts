import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodFactorsService } from './mood-factors.service';
import { MoodFactorsController } from './mood-factors.controller';
import { MoodFactor } from './entities/mood-factor.entity';
import { MoodEntriesModule } from '../mood-entries/mood-entries.module'; // Para validação de propriedade
import { AuthModule } from '../auth/auth.module'; // Para JwtAuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([MoodFactor]),
    MoodEntriesModule, // Importa para usar MoodEntriesService
    AuthModule, // Importa para usar JwtAuthGuard globalmente ou aqui
  ],
  controllers: [MoodFactorsController],
  providers: [MoodFactorsService],
})
export class MoodFactorsModule {}