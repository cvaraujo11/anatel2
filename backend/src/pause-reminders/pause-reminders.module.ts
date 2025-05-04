import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PauseRemindersService } from './pause-reminders.service';
import { PauseRemindersController } from './pause-reminders.controller';
import { PauseReminder } from './entities/pause-reminder.entity';
import { AuthModule } from '../auth/auth.module'; // Importa o AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([PauseReminder]), // Disponibiliza o repositório PauseReminder
    AuthModule, // Importa para ter acesso aos guards e estratégias de autenticação
  ],
  controllers: [PauseRemindersController],
  providers: [PauseRemindersService],
})
export class PauseRemindersModule {}