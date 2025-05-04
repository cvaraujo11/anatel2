import { Controller, Request, Post, UseGuards, Get, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
// import { GoogleOAuthGuard } from './google-oauth.guard'; // Usaremos AuthGuard('google') diretamente

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Rota de Login (Usuário/Senha) - Requer LocalAuthGuard
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) { // O usuário validado está em req.user
    return this.authService.login(req.user);
  }

  // Rota para iniciar o fluxo Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google')) // Usa o AuthGuard genérico com a estratégia 'google'
  async googleAuth(@Req() req) {
    // O Passport-Google-OAuth20 cuidará do redirecionamento para o Google
  }

  // Rota de Callback do Google OAuth
  @Get('google/callback')
  @UseGuards(AuthGuard('google')) // Usa o AuthGuard genérico com a estratégia 'google'
  googleAuthRedirect(@Req() req) {
    // O Passport-Google-OAuth20 processará o callback e anexará o usuário a req.user
    return this.authService.googleLogin(req); // Gera JWT para o usuário
  }

  // Rota de exemplo protegida por JWT
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    // req.user é populado pela JwtStrategy após validação do token
    return req.user;
  }

  // Rota de Registro de Usuário
  @Post('register')
  async register(@Body() createUserDto: any) { // Considerar usar um DTO específico para registro
    return this.authService.register(createUserDto);
  }
}