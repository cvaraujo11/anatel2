import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepRemindersService } from './sleep-reminders.service';
import { SleepRemindersController } from './sleep-reminders.controller';
import { SleepReminder } from './entities/sleep-reminder.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards

@Module({
  imports: [
    TypeOrmModule.forFeature([SleepReminder]), // Provide SleepReminder repository
    AuthModule, // Make AuthModule exports (like guards) available
  ],
  controllers: [SleepRemindersController],
  providers: [SleepRemindersService],
})
export class SleepRemindersModule {}