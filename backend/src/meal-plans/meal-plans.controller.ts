import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Caminho corrigido
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Opcional: Para documentação Swagger
import { MealPlan } from './entities/meal-plan.entity';

@ApiTags('Meal Plans') // Opcional: Swagger
@ApiBearerAuth() // Opcional: Swagger - Indica que requer autenticação Bearer
@UseGuards(JwtAuthGuard) // Aplica o guardião JWT a todas as rotas deste controlador
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal plan for the authenticated user' }) // Opcional: Swagger
  @ApiResponse({ status: 201, description: 'The meal plan has been successfully created.', type: MealPlan }) // Opcional: Swagger
  @ApiResponse({ status: 401, description: 'Unauthorized.' }) // Opcional: Swagger
  create(@Body() createMealPlanDto: CreateMealPlanDto, @Request() req) {
    // req.user deve ser populado pelo JwtAuthGuard
    const user = req.user;
    return this.mealPlansService.create(createMealPlanDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal plans for the authenticated user' }) // Opcional: Swagger
  @ApiResponse({ status: 200, description: 'List of meal plans.', type: [MealPlan] }) // Opcional: Swagger
  @ApiResponse({ status: 401, description: 'Unauthorized.' }) // Opcional: Swagger
  findAll(@Request() req) {
    const user = req.user;
    return this.mealPlansService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific meal plan by ID for the authenticated user' }) // Opcional: Swagger
  @ApiResponse({ status: 200, description: 'The meal plan details.', type: MealPlan }) // Opcional: Swagger
  @ApiResponse({ status: 401, description: 'Unauthorized.' }) // Opcional: Swagger
  @ApiResponse({ status: 404, description: 'Meal plan not found.' }) // Opcional: Swagger
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const user = req.user;
    return this.mealPlansService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific meal plan by ID for the authenticated user' }) // Opcional: Swagger
  @ApiResponse({ status: 200, description: 'The meal plan has been successfully updated.', type: MealPlan }) // Opcional: Swagger
  @ApiResponse({ status: 401, description: 'Unauthorized.' }) // Opcional: Swagger
  @ApiResponse({ status: 404, description: 'Meal plan not found.' }) // Opcional: Swagger
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMealPlanDto: UpdateMealPlanDto, @Request() req) {
    const user = req.user;
    return this.mealPlansService.update(id, updateMealPlanDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific meal plan by ID for the authenticated user' }) // Opcional: Swagger
  @ApiResponse({ status: 204, description: 'The meal plan has been successfully deleted.' }) // Opcional: Swagger
  @ApiResponse({ status: 401, description: 'Unauthorized.' }) // Opcional: Swagger
  @ApiResponse({ status: 404, description: 'Meal plan not found.' }) // Opcional: Swagger
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const user = req.user;
    // Retorna status 204 No Content implicitamente se bem-sucedido
    return this.mealPlansService.remove(id, user);
  }
}