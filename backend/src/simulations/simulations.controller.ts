import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assumindo o caminho do JwtAuthGuard

@UseGuards(JwtAuthGuard)
@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post()
  create(@Body() createSimulationDto: CreateSimulationDto, @Request() req) {
    return this.simulationsService.create(createSimulationDto, req.user.userId);
  }

  @Get()
  findAllForUser(@Request() req) {
    return this.simulationsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOneForUser(@Param('id') id: string, @Request() req) {
    return this.simulationsService.findOneForUser(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSimulationDto: UpdateSimulationDto, @Request() req) {
    return this.simulationsService.update(id, updateSimulationDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.simulationsService.remove(id, req.user.userId);
  }
}