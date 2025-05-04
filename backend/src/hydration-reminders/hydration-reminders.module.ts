import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HydrationRemindersService } from './hydration-reminders.service';
import { HydrationRemindersController } from './hydration-reminders.controller';
import { HydrationReminder } from './entities/hydration-reminder.entity';
import { AuthModule } from '../auth/auth.module'; // Importar AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([HydrationReminder]),
    AuthModule, // Adicionar AuthModule aos imports
  ],
  controllers: [HydrationRemindersController],
  providers: [HydrationRemindersService],
})
export class HydrationRemindersModule {}