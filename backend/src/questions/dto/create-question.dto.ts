import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsString()
  @IsNotEmpty()
  answer_text: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsUUID()
  @IsNotEmpty()
  competitionId: string;
}