import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrioritiesService } from './priorities.service';
import { PrioritiesController } from './priorities.controller';
import { Priority } from './entities/priority.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule if needed for user context

@Module({
  imports: [
    TypeOrmModule.forFeature([Priority]),
    UsersModule, // Include UsersModule if user service is needed
  ],
  controllers: [PrioritiesController],
  providers: [PrioritiesService],
})
export class PrioritiesModule {}