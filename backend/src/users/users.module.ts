import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Disponibiliza o repositório User
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Exporta o serviço para ser usado em outros módulos (ex: AuthModule)
})
export class UsersModule {}