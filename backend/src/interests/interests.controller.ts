import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assumindo o caminho para o JwtAuthGuard
import { Request } from 'express'; // Importar Request do express
import { User } from '../users/entities/user.entity'; // Importar a entidade User

interface AuthenticatedRequest extends Request {
  user: User; // Adicionar a propriedade user ao Request
}

@UseGuards(JwtAuthGuard) // Proteger todos os endpoints deste controller
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post()
  create(@Body() createInterestDto: CreateInterestDto, @Req() req: AuthenticatedRequest) {
    return this.interestsService.create(createInterestDto, req.user);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.interestsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.interestsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInterestDto: UpdateInterestDto, @Req() req: AuthenticatedRequest) {
    return this.interestsService.update(id, updateInterestDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.interestsService.remove(id, req.user.id);
  }
}