import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config'; // Para acessar variáveis de ambiente

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService, // Injetar ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'DEFAULT_SECRET'), // Usar ConfigService
    });
  }

  async validate(payload: any) {
    // Buscar o usuário no banco de dados usando o payload.sub (ID do usuário)
    const user = await this.usersService.findOneById(payload.sub); // Usar findOneById

    if (!user) {
      throw new UnauthorizedException();
    }

    // Retorna o objeto do usuário que será anexado a req.user
    // Excluir informações sensíveis como a senha antes de retornar
    const { passwordHash, ...result } = user;
    return result;
  }
}