import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import the JWT guard

@Controller('expenses') // Base path for all routes in this controller
@UseGuards(JwtAuthGuard) // Apply JWT authentication to all routes in this controller
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    // req.user is populated by JwtAuthGuard/JwtStrategy with the payload { userId: string, username: string }
    const userId = req.user.userId;
    return this.expensesService.create(createExpenseDto, userId);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.expensesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.userId;
    return this.expensesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.expensesService.update(id, updateExpenseDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Standard practice for DELETE success
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.userId;
    // The service handles the logic and potential NotFoundException
    return this.expensesService.remove(id, userId);
    // No explicit return needed here as the service returns void and we set HTTP 204
  }
}