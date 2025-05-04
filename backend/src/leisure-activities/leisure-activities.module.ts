import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeisureActivitiesService } from './leisure-activities.service';
import { LeisureActivitiesController } from './leisure-activities.controller';
import { LeisureActivity } from './entities/leisure-activity.entity';
import { AuthModule } from '../auth/auth.module'; // Importa AuthModule se o guard precisar de dependências dele

@Module({
  imports: [
    TypeOrmModule.forFeature([LeisureActivity]), // Registra a entidade LeisureActivity
    AuthModule, // Importa AuthModule para garantir que as dependências do JwtAuthGuard estejam disponíveis
  ],
  controllers: [LeisureActivitiesController],
  providers: [LeisureActivitiesService],
})
export class LeisureActivitiesModule {}