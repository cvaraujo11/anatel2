import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express'; // Para tipar o objeto req
import { User } from '../users/entities/user.entity'; // Para tipar o usuário

// Interface para estender o Request do Express e adicionar a propriedade user
interface RequestWithUser extends Request {
  user: User;
}

@UseGuards(JwtAuthGuard) // Aplicar o guardião JWT a todas as rotas deste controlador
@Controller('recipes') // Define o prefixo da rota base como /recipes
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Define o código de status HTTP para 201 Created
  create(@Body() createRecipeDto: CreateRecipeDto, @Req() req: RequestWithUser) {
    // O JwtAuthGuard anexa o objeto 'user' ao request
    const user = req.user;
    return this.recipesService.create(createRecipeDto, user);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.recipesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    // ParseUUIDPipe valida se o ID é um UUID válido
    const user = req.user;
    return this.recipesService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Req() req: RequestWithUser
  ) {
    const user = req.user;
    return this.recipesService.update(id, updateRecipeDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Define o código de status HTTP para 204 No Content
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.recipesService.remove(id, user.id);
  }
}