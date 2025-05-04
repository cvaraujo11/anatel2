import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  // Simula a validação de um usuário (substituir pela lógica real com UsersService)
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // O objeto 'user' aqui viria do validateUser ou da estratégia Google
    if (!user || !user.userId) {
        throw new UnauthorizedException('Credenciais inválidas ou usuário não encontrado.');
    }
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Método para lidar com o login/registro via Google (será chamado pelo GoogleStrategy)
  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('Nenhum usuário do Google retornado.');
    }

    const user = await this.usersService.findOrCreateFromGoogle(req.user);

    return this.login(user); // Gera e retorna o JWT para o usuário
  }

  // Método para registrar um novo usuário
  async register(createUserDto: any): Promise<any> { // Usar DTO específico para registro se necessário
    const user = await this.usersService.create(createUserDto);
    // Opcional: logar o usuário automaticamente após o registro
    // return this.login(user);
    const { passwordHash, ...result } = user;
    return result; // Retorna o usuário criado (sem a senha)
  }
}
