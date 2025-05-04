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
import { RestSuggestionsService } from './rest-suggestions.service';
import { CreateRestSuggestionDto } from './dto/create-rest-suggestion.dto';
import { UpdateRestSuggestionDto } from './dto/update-rest-suggestion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Importa o guard JWT
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Para documentação (opcional, mas bom)
import { RestSuggestion } from './entities/rest-suggestion.entity';

@ApiTags('Rest Suggestions') // Agrupa endpoints na documentação Swagger
@ApiBearerAuth() // Indica que os endpoints requerem autenticação Bearer (JWT)
@UseGuards(JwtAuthGuard) // Aplica o guard JWT a todos os endpoints deste controller
@Controller('rest-suggestions')
export class RestSuggestionsController {
  constructor(private readonly restSuggestionsService: RestSuggestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova sugestão de descanso para o usuário autenticado' })
  @ApiResponse({ status: 201, description: 'Sugestão criada com sucesso.', type: RestSuggestion })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() createRestSuggestionDto: CreateRestSuggestionDto, @Request() req): Promise<RestSuggestion> {
    const userId = req.user.userId; // Obtém o ID do usuário do token JWT
    return this.restSuggestionsService.create(createRestSuggestionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as sugestões de descanso do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de sugestões retornada com sucesso.', type: [RestSuggestion] })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(@Request() req): Promise<RestSuggestion[]> {
    const userId = req.user.userId;
    return this.restSuggestionsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma sugestão de descanso específica pelo ID para o usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Sugestão encontrada.', type: RestSuggestion })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Sugestão não encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<RestSuggestion> {
    const userId = req.user.userId;
    return this.restSuggestionsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma sugestão de descanso específica pelo ID para o usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Sugestão atualizada com sucesso.', type: RestSuggestion })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Sugestão não encontrada.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRestSuggestionDto: UpdateRestSuggestionDto,
    @Request() req,
  ): Promise<RestSuggestion> {
    const userId = req.user.userId;
    return this.restSuggestionsService.update(id, updateRestSuggestionDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content em caso de sucesso
  @ApiOperation({ summary: 'Remove uma sugestão de descanso específica pelo ID para o usuário autenticado' })
  @ApiResponse({ status: 204, description: 'Sugestão removida com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Sugestão não encontrada.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<void> {
    const userId = req.user.userId;
    return this.restSuggestionsService.remove(id, userId);
  }
}