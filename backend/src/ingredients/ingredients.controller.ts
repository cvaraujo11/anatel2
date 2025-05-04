import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto, @Req() req: Request) {
    // Assuming user is attached to the request by JwtAuthGuard
    return this.ingredientsService.create(createIngredientDto, req.user as any);
  }

  @Get()
  findAll(@Req() req: Request) {
    // Assuming user is attached to the request by JwtAuthGuard
    return this.ingredientsService.findAll(req.user as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    // Assuming user is attached to the request by JwtAuthGuard
    return this.ingredientsService.findOne(+id, req.user as any);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto, @Req() req: Request) {
    // Assuming user is attached to the request by JwtAuthGuard
    return this.ingredientsService.update(+id, updateIngredientDto, req.user as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    // Assuming user is attached to the request by JwtAuthGuard
    return this.ingredientsService.remove(+id, req.user as any);
  }
}