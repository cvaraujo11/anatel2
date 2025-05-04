import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from '../users/entities/user.entity'; // Import User entity if needed for relations

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense> {
    const newExpense = this.expensesRepository.create({
      ...createExpenseDto,
      user_id: userId, // Associate with the logged-in user
      date: new Date(createExpenseDto.date), // Convert date string to Date object
    });
    return this.expensesRepository.save(newExpense);
  }

  async findAll(userId: string): Promise<Expense[]> {
    return this.expensesRepository.find({ where: { user_id: userId } });
  }

  async findOne(id: string, userId: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id, user_id: userId } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found or access denied.`);
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string): Promise<Expense> {
    // First, ensure the expense exists and belongs to the user
    const expense = await this.findOne(id, userId);

    // Prepare data for merging, converting date if necessary
    const dataToUpdate: Partial<Expense> = {};
    for (const key in updateExpenseDto) {
      if (Object.prototype.hasOwnProperty.call(updateExpenseDto, key)) {
        if (key === 'date' && updateExpenseDto.date) {
          dataToUpdate.date = new Date(updateExpenseDto.date);
        } else {
          // Type assertion needed here as key is string, but we know it maps to Expense properties
          (dataToUpdate as any)[key] = (updateExpenseDto as any)[key];
        }
      }
    }

    // Merge the prepared data into the existing entity
    this.expensesRepository.merge(expense, dataToUpdate);

    // Save the updated entity
    return this.expensesRepository.save(expense);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Ensure the expense exists and belongs to the user before attempting removal
    const expense = await this.findOne(id, userId);
    const result = await this.expensesRepository.delete(expense.id);

    if (result.affected === 0) {
      // This case should ideally not happen if findOne succeeded, but good for robustness
      throw new NotFoundException(`Expense with ID "${id}" could not be deleted.`);
    }
    // No need to return anything on successful deletion (HTTP 204 No Content)
  }
}