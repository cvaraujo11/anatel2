import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { HydrationRemindersService } from './hydration-reminders.service';
import { CreateHydrationReminderDto } from './dto/create-hydration-reminder.dto';
import { UpdateHydrationReminderDto } from './dto/update-hydration-reminder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // For API documentation (optional but good practice)
import { HydrationReminder } from './entities/hydration-reminder.entity';

@ApiTags('hydration-reminders') // Tag for Swagger documentation
@ApiBearerAuth() // Indicates JWT authentication is required
@UseGuards(JwtAuthGuard) // Apply JWT guard to the entire controller
@Controller('hydration-reminders')
export class HydrationRemindersController {
  constructor(private readonly hydrationRemindersService: HydrationRemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hydration reminder for the authenticated user' })
  @ApiResponse({ status: 201, description: 'The reminder has been successfully created.', type: HydrationReminder })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createHydrationReminderDto: CreateHydrationReminderDto, @Request() req) {
    // req.user is populated by JwtAuthGuard
    return this.hydrationRemindersService.create(createHydrationReminderDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hydration reminders for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of reminders.', type: [HydrationReminder] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Request() req) {
    return this.hydrationRemindersService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific hydration reminder by ID for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The reminder details.', type: HydrationReminder })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reminder not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.hydrationRemindersService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific hydration reminder by ID for the authenticated user' })
  @ApiResponse({ status: 200, description: 'The reminder has been successfully updated.', type: HydrationReminder })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reminder not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateHydrationReminderDto: UpdateHydrationReminderDto, @Request() req) {
    return this.hydrationRemindersService.update(id, updateHydrationReminderDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific hydration reminder by ID for the authenticated user' })
  @ApiResponse({ status: 204, description: 'The reminder has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reminder not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.hydrationRemindersService.remove(id, req.user); // Service returns void, controller implicitly returns 204 on success
  }
}