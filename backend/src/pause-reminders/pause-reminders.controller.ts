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
  ParseUUIDPipe, // Para validar que o ID é um UUID
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PauseRemindersService } from './pause-reminders.service';
import { CreatePauseReminderDto } from './dto/create-pause-reminder.dto';
import { UpdatePauseReminderDto } from './dto/update-pause-reminder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Caminho corrigido
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Para documentação (opcional, mas bom)
import { PauseReminder } from './entities/pause-reminder.entity';

@ApiTags('Pause Reminders') // Agrupa endpoints na documentação Swagger
@ApiBearerAuth() // Indica que requer autenticação Bearer (JWT)
@UseGuards(JwtAuthGuard) // Aplica o guard JWT a todos os endpoints deste controller
@Controller('pause-reminders')
export class PauseRemindersController {
  constructor(private readonly pauseRemindersService: PauseRemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pause reminder for the authenticated user' })
  @ApiResponse({ status: 201, description: 'The reminder has been successfully created.', type: PauseReminder })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createPauseReminderDto: CreatePauseReminderDto, @Request() req): Promise<PauseReminder> {
    // Assumindo que o JwtAuthGuard adiciona req.user com a propriedade id (string UUID)
    const userId = req.user.id;
    return this.pauseRemindersService.create(createPauseReminderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pause reminders for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of reminders.', type: [PauseReminder] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Request() req): Promise<PauseReminder[]> {
    const userId = req.user.id;
    return this.pauseRemindersService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific pause reminder by ID for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The reminder details.', type: PauseReminder })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reminder not found or does not belong to the user.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<PauseReminder> {
    const userId = req.user.id;
    return this.pauseRemindersService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific pause reminder by ID for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The reminder has been successfully updated.', type: PauseReminder })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reminder not found or does not belong to the user.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePauseReminderDto: UpdatePauseReminderDto,
    @Request() req,
  ): Promise<PauseReminder> {
    const userId = req.user.id;
    return this.pauseRemindersService.update(id, updatePauseReminderDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content em caso de sucesso
  @ApiOperation({ summary: 'Delete a specific pause reminder by ID for the authenticated user' })
  @ApiResponse({ status: 204, description: 'The reminder has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reminder not found or does not belong to the user.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<void> {
    const userId = req.user.id;
    return this.pauseRemindersService.remove(id, userId);
  }
}