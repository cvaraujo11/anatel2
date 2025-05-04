import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { UsersModule } from '../users/users.module'; // Importar UsersModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importar ConfigModule e ConfigService

@Module({
  imports: [
    UsersModule, // Adicionar UsersModule aos imports
    PassportModule,
    JwtModule.registerAsync({ // Usar registerAsync para carregar segredo do .env
      imports: [ConfigModule], // Importar ConfigModule para usar ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Obter segredo do .env
        signOptions: { expiresIn: '60m' }, // Token expira em 60 minutos
      }),
      inject: [ConfigService], // Injetar ConfigService
    }),
    ConfigModule, // Importar ConfigModule para acesso às variáveis de ambiente
  ],
  providers: [
    AuthService, // UsersService é provido pelo UsersModule importado
    JwtStrategy,
    GoogleStrategy,
    // LocalStrategy será adicionado se necessário para login com credenciais
  ],
  controllers: [AuthController],
  exports: [AuthService], // Exportar AuthService se outros módulos precisarem dele
})
export class AuthModule {}
