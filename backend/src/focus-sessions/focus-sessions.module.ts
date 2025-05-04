import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FocusSessionsService } from './focus-sessions.service';
import { FocusSessionsController } from './focus-sessions.controller';
import { FocusSession } from './entities/focus-session.entity';
import { Project } from '../projects/entities/project.entity';
import { AuthModule } from '../auth/auth.module'; // Assumindo que o AuthModule está neste caminho

@Module({
  imports: [
    TypeOrmModule.forFeature([FocusSession, Project]),
    AuthModule,
  ],
  controllers: [FocusSessionsController],
  providers: [FocusSessionsService],
})
export class FocusSessionsModule {}