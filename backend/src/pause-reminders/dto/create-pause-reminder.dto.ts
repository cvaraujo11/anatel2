import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePauseReminderDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  interval_minutes: number; // Nome corrigido

  @IsBoolean()
  @IsOptional() // Opcional na criação, default é true na entidade
  active?: boolean;

  // userId será inferido do token JWT no controller/service
  // message e duration removidos pois não existem na entidade
}