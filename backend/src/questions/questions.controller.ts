import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @Req() req: Request) {
    const user = req.user as User;
    return this.questionsService.create(createQuestionDto, user);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as User;
    return this.questionsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    return this.questionsService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto, @Req() req: Request) {
    const user = req.user as User;
    return this.questionsService.update(id, updateQuestionDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    return this.questionsService.remove(id, user);
  }
}