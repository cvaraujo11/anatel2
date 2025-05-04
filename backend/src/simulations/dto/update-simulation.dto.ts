import { PartialType } from '@nestjs/mapped-types';
import { CreateSimulationDto } from './create-simulation.dto';
import { IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateSimulationDto extends PartialType(CreateSimulationDto) {
    @IsOptional()
    @IsNumber()
    competitionId?: number;

    @IsOptional()
    @IsDateString()
    start_time?: Date;

    @IsOptional()
    @IsDateString()
    end_time?: Date;

    @IsOptional()
    @IsNumber()
    score?: number;
}