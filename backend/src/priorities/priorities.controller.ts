import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { PrioritiesService } from './priorities.service';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express'; // Import Request
import { User } from '../users/entities/user.entity'; // Import User entity

// Helper interface to extend Request type
interface RequestWithUser extends Request {
  user: User;
}

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('priorities')
export class PrioritiesController {
  constructor(private readonly prioritiesService: PrioritiesService) {}

  @Post()
  create(@Body() createPriorityDto: CreatePriorityDto, @Req() req: RequestWithUser) {
    // Extract user from the request (added by JwtAuthGuard/Passport)
    const user = req.user;
    return this.prioritiesService.create(createPriorityDto, user);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.prioritiesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.prioritiesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePriorityDto: UpdatePriorityDto,
    @Req() req: RequestWithUser
  ) {
    const user = req.user;
    return this.prioritiesService.update(id, updatePriorityDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.prioritiesService.remove(id, user);
  }
}