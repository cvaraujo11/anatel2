import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { Competition } from './entities/competition.entity';
import { AuthModule } from '../auth/auth.module'; // Assuming the path to AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Competition]),
    AuthModule, // Import AuthModule to use JwtAuthGuard
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService],
})
export class CompetitionsModule {}