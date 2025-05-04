import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySessionsService } from './study-sessions.service';
import { StudySessionsController } from './study-sessions.controller';
import { StudySession } from './entities/study-session.entity';
import { AuthModule } from '../auth/auth.module'; // Importa o AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([StudySession]), // Registra a entidade StudySession com TypeORM
    AuthModule, // Importa o AuthModule para usar o JwtAuthGuard
  ],
  controllers: [StudySessionsController],
  providers: [StudySessionsService],
})
export class StudySessionsModule {}