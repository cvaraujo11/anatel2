import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MedicationChecklistService } from './medication-checklist.service';
import { CreateMedicationChecklistDto } from './dto/create-medication-checklist.dto';
import { UpdateMedicationChecklistDto } from './dto/update-medication-checklist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assumindo o caminho do seu JwtAuthGuard
import { Request } from 'express';
import { User } from '../users/entities/user.entity'; // Assumindo o caminho da sua entidade User

interface AuthenticatedRequest extends Request {
  user: User;
}

@UseGuards(JwtAuthGuard)
@Controller('medication-checklist')
export class MedicationChecklistController {
  constructor(private readonly medicationChecklistService: MedicationChecklistService) {}

  @Post()
  create(@Body() createMedicationChecklistDto: CreateMedicationChecklistDto, @Req() req: AuthenticatedRequest) {
    return this.medicationChecklistService.create(createMedicationChecklistDto, req.user);
  }

  @Get()
  findAllForUser(@Req() req: AuthenticatedRequest) {
    return this.medicationChecklistService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOneForUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.medicationChecklistService.findOneForUser(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicationChecklistDto: UpdateMedicationChecklistDto, @Req() req: AuthenticatedRequest) {
    return this.medicationChecklistService.update(id, updateMedicationChecklistDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.medicationChecklistService.remove(id, req.user.id);
  }
}