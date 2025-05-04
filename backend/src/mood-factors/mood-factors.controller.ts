import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Req, // Para obter o usuário do request
  Query, // Para buscar por moodEntryId
} from '@nestjs/common';
import { MoodFactorsService } from './mood-factors.service';
import { CreateMoodFactorDto } from './dto/create-mood-factor.dto';
import { UpdateMoodFactorDto } from './dto/update-mood-factor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity'; // Para tipo do usuário
// Assumindo que existe um decorador @GetUser ou que pegamos do Req
// import { GetUser } from '../auth/decorators/get-user.decorator'; // Exemplo

// Importações do Swagger (opcional, mas recomendado)
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MoodFactor } from './entities/mood-factor.entity';

@ApiTags('Mood Factors')
@ApiBearerAuth() // Indica que as rotas precisam de autenticação JWT
@UseGuards(JwtAuthGuard) // Aplica o guardião JWT a todas as rotas deste controller
@Controller('mood-factors')
export class MoodFactorsController {
  constructor(private readonly moodFactorsService: MoodFactorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mood factor for a specific mood entry' })
  @ApiResponse({ status: 201, description: 'The mood factor has been successfully created.', type: MoodFactor })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Mood entry does not belong to the user.' })
  @ApiResponse({ status: 404, description: 'Mood entry not found.' })
  create(@Body() createMoodFactorDto: CreateMoodFactorDto, @Req() req): Promise<MoodFactor> {
    const user: User = req.user; // Obtém o usuário do request (assumindo que o guardião o anexa)
    return this.moodFactorsService.create(createMoodFactorDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all mood factors for a specific mood entry belonging to the user' })
  @ApiQuery({ name: 'moodEntryId', required: true, description: 'ID of the mood entry', type: String })
  @ApiResponse({ status: 200, description: 'List of mood factors.', type: [MoodFactor] })
  @ApiResponse({ status: 400, description: 'Bad Request (Missing moodEntryId).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Mood entry does not belong to the user.' })
  @ApiResponse({ status: 404, description: 'Mood entry not found.' })
  findAllByMoodEntry(
      @Query('moodEntryId', ParseUUIDPipe) moodEntryId: string,
      @Req() req
  ): Promise<MoodFactor[]> {
    const user: User = req.user;
    return this.moodFactorsService.findAllByMoodEntry(moodEntryId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific mood factor by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the mood factor', type: String })
  @ApiResponse({ status: 200, description: 'The mood factor.', type: MoodFactor })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Mood factor does not belong to the user.' })
  @ApiResponse({ status: 404, description: 'Mood factor not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<MoodFactor> {
    const user: User = req.user;
    return this.moodFactorsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific mood factor by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the mood factor', type: String })
  @ApiResponse({ status: 200, description: 'The updated mood factor.', type: MoodFactor })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Mood factor does not belong to the user or attempt to change mood entry.' })
  @ApiResponse({ status: 404, description: 'Mood factor not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMoodFactorDto: UpdateMoodFactorDto,
    @Req() req
  ): Promise<MoodFactor> {
    const user: User = req.user;
    return this.moodFactorsService.update(id, updateMoodFactorDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific mood factor by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the mood factor', type: String })
  @ApiResponse({ status: 204, description: 'The mood factor has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Mood factor does not belong to the user.' })
  @ApiResponse({ status: 404, description: 'Mood factor not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<void> {
    const user: User = req.user;
    return this.moodFactorsService.remove(id, user.id);
  }
}