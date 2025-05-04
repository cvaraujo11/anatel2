import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assumindo que existe um guard JWT

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Rota protegida para obter o perfil do usuário logado
  @UseGuards(JwtAuthGuard) // Protege a rota com autenticação JWT
  @Get('profile')
  getProfile(@Request() req: any) { // Adiciona tipo 'any' ao req
    // O req.user é populado pelo JwtAuthGuard com os dados do payload do token (ex: userId)
    // A implementação completa buscaria o usuário pelo ID, mas por enquanto retorna o payload
    return req.user;
  }

  // Outras rotas (criar usuário, etc.) podem ser adicionadas aqui
  // A rota de criação de usuário geralmente não fica aqui, mas sim em um AuthController
}