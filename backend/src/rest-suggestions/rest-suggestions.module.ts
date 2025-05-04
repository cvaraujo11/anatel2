import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestSuggestionsService } from './rest-suggestions.service';
import { RestSuggestionsController } from './rest-suggestions.controller';
import { RestSuggestion } from './entities/rest-suggestion.entity';
import { AuthModule } from '../auth/auth.module'; // Importa AuthModule para disponibilizar JwtAuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([RestSuggestion]), // Registra a entidade RestSuggestion
    AuthModule, // Importa o AuthModule para que o JwtAuthGuard funcione corretamente
  ],
  controllers: [RestSuggestionsController],
  providers: [RestSuggestionsService],
})
export class RestSuggestionsModule {}