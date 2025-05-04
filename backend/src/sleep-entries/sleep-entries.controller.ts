import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SleepEntriesService } from './sleep-entries.service';
import { CreateSleepEntryDto } from './dto/create-sleep-entry.dto';
import { UpdateSleepEntryDto } from './dto/update-sleep-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Caminho corrigido
import { SleepEntry } from './entities/sleep-entry.entity';

@Controller('sleep-entries')
@UseGuards(JwtAuthGuard) // Aplica o guard a todas as rotas do controller
export class SleepEntriesController {
  constructor(private readonly sleepEntriesService: SleepEntriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createSleepEntryDto: CreateSleepEntryDto,
    @Request() req, // req.user será populado pelo JwtAuthGuard
  ): Promise<SleepEntry> {
    const userId = req.user.userId; // Extrai o ID do usuário do token JWT
    return this.sleepEntriesService.create(createSleepEntryDto, userId);
  }

  @Get()
  findAll(@Request() req): Promise<SleepEntry[]> {
    const userId = req.user.userId;
    return this.sleepEntriesService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<SleepEntry> {
    const userId = req.user.userId;
    return this.sleepEntriesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSleepEntryDto: UpdateSleepEntryDto,
    @Request() req,
  ): Promise<SleepEntry> {
    const userId = req.user.userId;
    return this.sleepEntriesService.update(id, updateSleepEntryDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 em caso de sucesso
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    const userId = req.user.userId;
    return this.sleepEntriesService.remove(id, userId);
  }
}