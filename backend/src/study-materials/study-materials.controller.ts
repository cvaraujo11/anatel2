import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { StudyMaterialsService } from './study-materials.service';
import { CreateStudyMaterialDto } from './dto/create-study-material.dto';
import { UpdateStudyMaterialDto } from './dto/update-study-material.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@UseGuards(JwtAuthGuard)
@Controller('study-materials')
export class StudyMaterialsController {
  constructor(private readonly studyMaterialsService: StudyMaterialsService) {}

  @Post()
  create(@Body() createStudyMaterialDto: CreateStudyMaterialDto, @Req() req: RequestWithUser) {
    return this.studyMaterialsService.create(createStudyMaterialDto, req.user);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.studyMaterialsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.studyMaterialsService.findOne(+id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudyMaterialDto: UpdateStudyMaterialDto, @Req() req: RequestWithUser) {
    return this.studyMaterialsService.update(+id, updateStudyMaterialDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.studyMaterialsService.remove(+id, req.user);
  }
}