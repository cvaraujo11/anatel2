import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust path if necessary
import { Request } from 'express'; // Import Request type

// Define an interface for the request object with the user property
interface RequestWithUser extends Request {
  user: { id: string; username: string }; // Adjust user properties based on your JWT payload
}

@Controller('medications')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  create(@Body() createMedicationDto: CreateMedicationDto, @Req() req: RequestWithUser) {
    // Assuming JwtAuthGuard attaches user to request
    return this.medicationsService.create(createMedicationDto, req.user.id); // Pass only user ID
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.medicationsService.findAll(req.user.id); // Pass only user ID
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    return this.medicationsService.findOne(id, req.user.id); // Pass only user ID
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.medicationsService.update(id, updateMedicationDto, req.user.id); // Pass only user ID
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content on successful deletion
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    return this.medicationsService.remove(id, req.user.id); // Pass only user ID
  }
}