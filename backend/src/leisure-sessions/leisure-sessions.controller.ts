import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Req } from '@nestjs/common';
import { LeisureSessionsService } from './leisure-sessions.service';
import { CreateLeisureSessionDto } from './dto/create-leisure-session.dto';
import { UpdateLeisureSessionDto } from './dto/update-leisure-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Caminho corrigido
// import { GetUser } from '../auth/decorators/get-user.decorator'; // Decorator não encontrado, usar @Req()
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Para documentação Swagger (opcional, mas boa prática)
import { LeisureSession } from './entities/leisure-session.entity';

@ApiTags('Leisure Sessions') // Agrupa endpoints no Swagger
@ApiBearerAuth() // Indica que a autenticação JWT é necessária
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
@Controller('leisure-sessions')
export class LeisureSessionsController {
  constructor(private readonly leisureSessionsService: LeisureSessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new leisure session for the authenticated user' })
  @ApiResponse({ status: 201, description: 'The leisure session has been successfully created.', type: LeisureSession })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Associated Leisure Activity not found.' })
  create(@Body() createLeisureSessionDto: CreateLeisureSessionDto, @Req() req): Promise<LeisureSession> {
    const user = req.user as User; // Extrai o usuário do request
    return this.leisureSessionsService.create(createLeisureSessionDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leisure sessions for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all leisure sessions.', type: [LeisureSession] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Req() req): Promise<LeisureSession[]> {
    const user = req.user as User; // Extrai o usuário do request
    return this.leisureSessionsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific leisure session by ID for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return the leisure session.', type: LeisureSession })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Leisure Session not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<LeisureSession> {
    const user = req.user as User; // Extrai o usuário do request
    return this.leisureSessionsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific leisure session by ID for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The leisure session has been successfully updated.', type: LeisureSession })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Leisure Session or associated Leisure Activity not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeisureSessionDto: UpdateLeisureSessionDto,
    @Req() req
  ): Promise<LeisureSession> {
    const user = req.user as User; // Extrai o usuário do request
    return this.leisureSessionsService.update(id, updateLeisureSessionDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific leisure session by ID for the authenticated user' })
  @ApiResponse({ status: 204, description: 'The leisure session has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Leisure Session not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<void> {
     const user = req.user as User; // Extrai o usuário do request
     // Retorna 204 No Content, então o tipo de retorno é Promise<void>
     return this.leisureSessionsService.remove(id, user);
  }
}