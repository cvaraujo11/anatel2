import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationHistoryService } from './simulation-history.service';
import { SimulationHistoryController } from './simulation-history.controller';
import { SimulationHistory } from './entities/simulation-history.entity';
import { Simulation } from '../simulations/entities/simulation.entity';
import { Question } from '../questions/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SimulationHistory, Simulation, Question]),
  ],
  controllers: [SimulationHistoryController],
  providers: [SimulationHistoryService],
  exports: [SimulationHistoryService],
})
export class SimulationHistoryModule {}