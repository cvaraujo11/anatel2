import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { Simulation } from './entities/simulation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Simulation])],
  controllers: [SimulationsController],
  providers: [SimulationsService],
  exports: [SimulationsService],
})
export class SimulationsModule {}