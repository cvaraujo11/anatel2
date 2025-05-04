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
import { SleepRemindersService } from './sleep-reminders.service';
import { CreateSleepReminderDto } from './dto/create-sleep-reminder.dto';
import { UpdateSleepReminderDto } from './dto/update-sleep-reminder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Corrected path to JwtAuthGuard
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SleepReminder } from './entities/sleep-reminder.entity';

@ApiTags('Sleep Reminders')
@ApiBearerAuth() // Indicate that JWT authentication is required
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('sleep-reminders')
export class SleepRemindersController {
  constructor(private readonly sleepRemindersService: SleepRemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo lembrete de sono' })
  @ApiResponse({ status: 201, description: 'Lembrete de sono criado com sucesso.', type: SleepReminder })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() createSleepReminderDto: CreateSleepReminderDto, @Req() req): Promise<SleepReminder> {
    const userId = req.user.userId; // Extract userId from the authenticated user payload
    return this.sleepRemindersService.create(createSleepReminderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os lembretes de sono do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de lembretes de sono.', type: [SleepReminder] })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(@Req() req): Promise<SleepReminder[]> {
    const userId = req.user.userId;
    return this.sleepRemindersService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um lembrete de sono específico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do lembrete de sono (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Detalhes do lembrete de sono.', type: SleepReminder })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lembrete de sono não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<SleepReminder> {
    const userId = req.user.userId;
    return this.sleepRemindersService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um lembrete de sono existente' })
  @ApiParam({ name: 'id', description: 'ID do lembrete de sono a ser atualizado (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Lembrete de sono atualizado com sucesso.', type: SleepReminder })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lembrete de sono não encontrado.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSleepReminderDto: UpdateSleepReminderDto,
    @Req() req,
  ): Promise<SleepReminder> {
    const userId = req.user.userId;
    return this.sleepRemindersService.update(id, updateSleepReminderDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on successful deletion
  @ApiOperation({ summary: 'Excluir um lembrete de sono' })
  @ApiParam({ name: 'id', description: 'ID do lembrete de sono a ser excluído (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Lembrete de sono excluído com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Lembrete de sono não encontrado.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<void> {
    const userId = req.user.userId;
    return this.sleepRemindersService.remove(id, userId);
  }
}