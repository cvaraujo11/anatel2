import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestSuggestionDto } from './dto/create-rest-suggestion.dto';
import { UpdateRestSuggestionDto } from './dto/update-rest-suggestion.dto';
import { RestSuggestion } from './entities/rest-suggestion.entity';

@Injectable()
export class RestSuggestionsService {
  constructor(
    @InjectRepository(RestSuggestion)
    private readonly restSuggestionRepository: Repository<RestSuggestion>,
  ) {}

  async create(createRestSuggestionDto: CreateRestSuggestionDto, userId: string): Promise<RestSuggestion> {
    // Formata a data para YYYY-MM-DD ou usa a data atual formatada
    const suggestionDateString = createRestSuggestionDto.suggestion_date
      ? new Date(createRestSuggestionDto.suggestion_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const newSuggestion = this.restSuggestionRepository.create({
      ...createRestSuggestionDto,
      suggestion_date: suggestionDateString,
      // Explicitamente faz o cast para User para satisfazer o TypeScript,
      // TypeORM deve lidar com a relação usando apenas o ID.
      user: { id: userId } as any, // Usando 'any' para simplificar, mas poderia ser 'User'
    });
    return this.restSuggestionRepository.save(newSuggestion);
  }

  async findAll(userId: string): Promise<RestSuggestion[]> {
    return this.restSuggestionRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' }, // Corrigido para created_at
    });
  }

  async findOne(id: string, userId: string): Promise<RestSuggestion> {
    const suggestion = await this.restSuggestionRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!suggestion) {
      throw new NotFoundException(`Sugestão de descanso com ID "${id}" não encontrada para este usuário.`);
    }
    return suggestion;
  }

  async update(id: string, updateRestSuggestionDto: UpdateRestSuggestionDto, userId: string): Promise<RestSuggestion> {
    const suggestion = await this.findOne(id, userId); // Garante que a sugestão existe e pertence ao usuário

    // Atualiza os campos fornecidos no DTO
    if (updateRestSuggestionDto.suggestion_text !== undefined) {
      suggestion.suggestion_text = updateRestSuggestionDto.suggestion_text;
    }
    if (updateRestSuggestionDto.suggestion_date !== undefined) {
      // Formata a data para YYYY-MM-DD
      suggestion.suggestion_date = new Date(updateRestSuggestionDto.suggestion_date).toISOString().split('T')[0];
    }
    if (updateRestSuggestionDto.is_taken !== undefined) {
      suggestion.is_taken = updateRestSuggestionDto.is_taken;
    }

    return this.restSuggestionRepository.save(suggestion);
  }

  async remove(id: string, userId: string): Promise<void> {
    const suggestion = await this.findOne(id, userId); // Garante que a sugestão existe e pertence ao usuário
    const result = await this.restSuggestionRepository.delete(id);
    if (result.affected === 0) {
      // Embora findOne já verifique, é uma boa prática verificar o resultado do delete
      throw new NotFoundException(`Falha ao remover a sugestão de descanso com ID "${id}".`);
    }
  }
}