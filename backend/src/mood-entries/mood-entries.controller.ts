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
import { MoodEntriesService } from './mood-entries.service';
import { CreateMoodEntryDto } from './dto/create-mood-entry.dto';
import { UpdateMoodEntryDto } from './dto/update-mood-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Caminho corrigido

@Controller('mood-entries')
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
export class MoodEntriesController {
  constructor(private readonly moodEntriesService: MoodEntriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMoodEntryDto: CreateMoodEntryDto, @Request() req) {
    // Extrai o userId do objeto user anexado à requisição pelo JwtAuthGuard
    const userId = req.user.userId;
    return this.moodEntriesService.create(createMoodEntryDto, userId);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.moodEntriesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.userId;
    return this.moodEntriesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMoodEntryDto: UpdateMoodEntryDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.moodEntriesService.update(id, updateMoodEntryDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.userId;
    return this.moodEntriesService.remove(id, userId);
  }
}