import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SimulationHistoryService } from './simulation-history.service';
import { CreateSimulationHistoryDto } from './dto/create-simulation-history.dto';
import { UpdateSimulationHistoryDto } from './dto/update-simulation-history.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('simulation-history')
@UseGuards(JwtAuthGuard)
@Controller('simulation-history')
export class SimulationHistoryController {
  constructor(private readonly simulationHistoryService: SimulationHistoryService) {}

  @Post()
  create(@Body() createSimulationHistoryDto: CreateSimulationHistoryDto) {
    // Assuming simulationId is provided in the DTO and the service handles validation and association
    return this.simulationHistoryService.create(createSimulationHistoryDto);
  }

  @Get('simulation/:simulationId')
  findAllForSimulation(@Param('simulationId') simulationId: string) {
    return this.simulationHistoryService.findAllForSimulation(simulationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.simulationHistoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSimulationHistoryDto: UpdateSimulationHistoryDto) {
    return this.simulationHistoryService.update(id, updateSimulationHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.simulationHistoryService.remove(id);
  }
}