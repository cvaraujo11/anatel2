import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSleepReminderDto {
  @ApiProperty({
    description: 'Horário do lembrete para dormir (formato ISO 8601)',
    example: '2025-05-04T22:00:00.000Z',
  })
  @IsNotEmpty({ message: 'O horário do lembrete para dormir não pode estar vazio.' })
  @IsDateString({}, { message: 'O horário do lembrete para dormir deve ser uma data válida no formato ISO 8601.' })
  bedtime_reminder: string;

  @ApiProperty({
    description: 'Horário do lembrete para acordar (formato ISO 8601)',
    example: '2025-05-05T07:00:00.000Z',
  })
  @IsNotEmpty({ message: 'O horário do lembrete para acordar não pode estar vazio.' })
  @IsDateString({}, { message: 'O horário do lembrete para acordar deve ser uma data válida no formato ISO 8601.' })
  wake_up_reminder: string;

  @ApiProperty({
    description: 'Indica se o lembrete está ativo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser um valor booleano.' })
  active?: boolean = true;
}