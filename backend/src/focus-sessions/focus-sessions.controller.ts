import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FocusSessionsService } from './focus-sessions.service';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('focus-sessions')
export class FocusSessionsController {
  constructor(private readonly focusSessionsService: FocusSessionsService) {}

  @Post()
  create(@Body() createFocusSessionDto: CreateFocusSessionDto, @Request() req) {
    return this.focusSessionsService.create(createFocusSessionDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.focusSessionsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.focusSessionsService.findOneForUser(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFocusSessionDto: UpdateFocusSessionDto, @Request() req) {
    return this.focusSessionsService.update(id, updateFocusSessionDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.focusSessionsService.remove(id, req.user.id);
  }
}