import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeisureActivitiesService } from './leisure-activities.service';
import { CreateLeisureActivityDto } from './dto/create-leisure-activity.dto';
import { UpdateLeisureActivityDto } from './dto/update-leisure-activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importa o guard JWT
import { Request } from 'express'; // Para tipar o objeto de requisição

// Aplica o guard JWT a todas as rotas deste controller
@UseGuards(JwtAuthGuard)
@Controller('leisure-activities')
export class LeisureActivitiesController {
  constructor(private readonly leisureActivitiesService: LeisureActivitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Define o status code para 201 Created
  create(@Body() createLeisureActivityDto: CreateLeisureActivityDto, @Req() req: Request) {
    // Extrai o userId do objeto user anexado à requisição pelo JwtAuthGuard
    const userId = (req.user as any)?.userId;
    if (!userId) {
      // Isso não deve acontecer se o guard estiver funcionando, mas é uma segurança extra
      throw new Error('UserID não encontrado na requisição.');
    }
    return this.leisureActivitiesService.create(createLeisureActivityDto, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      throw new Error('UserID não encontrado na requisição.');
    }
    return this.leisureActivitiesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    // ParseUUIDPipe valida se o ID é um UUID válido
    const userId = (req.user as any)?.userId;
    if (!userId) {
      throw new Error('UserID não encontrado na requisição.');
    }
    return this.leisureActivitiesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeisureActivityDto: UpdateLeisureActivityDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      throw new Error('UserID não encontrado na requisição.');
    }
    return this.leisureActivitiesService.update(id, updateLeisureActivityDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Define o status code para 204 No Content
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      throw new Error('UserID não encontrado na requisição.');
    }
    return this.leisureActivitiesService.remove(id, userId);
  }
}