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
} from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importa o guard JWT

@Controller('study-sessions') // Define o prefixo da rota para este controlador
@UseGuards(JwtAuthGuard) // Aplica o guard JWT a todas as rotas deste controlador
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post()
  create(@Body() createStudySessionDto: CreateStudySessionDto, @Request() req) {
    // req.user é populado pelo JwtAuthGuard/JwtStrategy com o payload do token
    const userId = req.user.userId;
    return this.studySessionsService.create(createStudySessionDto, userId);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.studySessionsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    // ParseUUIDPipe valida se o ID é um UUID válido
    const userId = req.user.userId;
    return this.studySessionsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudySessionDto: UpdateStudySessionDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.studySessionsService.update(id, updateStudySessionDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.userId;
    // Retorna status 204 No Content implicitamente em caso de sucesso
    return this.studySessionsService.remove(id, userId);
  }
}