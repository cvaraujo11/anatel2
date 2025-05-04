import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './entities/expense.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if JwtAuthGuard is used globally or needs dependencies from it

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]), // Register the Expense entity
    AuthModule, // Make AuthModule exports available (e.g., JwtStrategy used by JwtAuthGuard)
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}