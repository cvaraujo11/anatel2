import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeisureSessionsService } from './leisure-sessions.service';
import { LeisureSessionsController } from './leisure-sessions.controller';
import { LeisureSession } from './entities/leisure-session.entity';
import { AuthModule } from '../auth/auth.module'; // Para usar JwtAuthGuard
import { LeisureActivitiesModule } from '../leisure-activities/leisure-activities.module'; // Para injetar LeisureActivityRepository
import { LeisureActivity } from '../leisure-activities/entities/leisure-activity.entity'; // Importar entidade para forFeature

@Module({
  imports: [
    TypeOrmModule.forFeature([LeisureSession, LeisureActivity]), // Importa Repositórios
    AuthModule, // Disponibiliza JwtAuthGuard e funcionalidades de autenticação
    LeisureActivitiesModule, // Garante que o LeisureActivityRepository esteja disponível (alternativamente, poderia importar apenas TypeOrmModule.forFeature([LeisureActivity]) se LeisureActivitiesModule não exportar)
  ],
  controllers: [LeisureSessionsController],
  providers: [LeisureSessionsService],
})
export class LeisureSessionsModule {}