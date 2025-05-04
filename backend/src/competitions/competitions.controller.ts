import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  create(@Body() createCompetitionDto: CreateCompetitionDto, @Request() req) {
    return this.competitionsService.create(createCompetitionDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.competitionsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.competitionsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompetitionDto: UpdateCompetitionDto, @Request() req) {
    return this.competitionsService.update(id, updateCompetitionDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.competitionsService.remove(id, req.user);
  }
}