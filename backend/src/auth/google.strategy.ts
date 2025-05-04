import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Para acessar variáveis de ambiente
import { UsersService } from '../users/users.service'; // Para usar findOrCreateFromGoogle

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService, // Injetar ConfigService
    private usersService: UsersService, // Injetar UsersService
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID'), // Usar ConfigService
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET'), // Usar ConfigService
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:3001/auth/google/callback'), // Usar ConfigService
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, name, emails, photos } = profile;
    const googleProfile = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      accessToken,
      refreshToken, // Armazenar refreshToken se necessário para acesso offline
    };

    // Usar o UsersService para encontrar ou criar o usuário no banco de dados
    const user = await this.usersService.findOrCreateFromGoogle(googleProfile);

    done(null, user); // Passa o objeto do usuário do nosso DB para o callback 'done'
  }
}