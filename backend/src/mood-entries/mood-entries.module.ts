import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodEntriesService } from './mood-entries.service';
import { MoodEntriesController } from './mood-entries.controller';
import { MoodEntry } from './entities/mood-entry.entity';
// O AuthModule provavelmente já está importado globalmente ou no AppModule,
// tornando o JwtAuthGuard disponível. Se não estiver, descomente a linha abaixo.
// import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoodEntry]),
    // AuthModule, // Descomente se necessário
  ],
  controllers: [MoodEntriesController],
  providers: [MoodEntriesService],
})
export class MoodEntriesModule {}