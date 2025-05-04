import { PartialType } from '@nestjs/mapped-types';
import { CreateStudySessionDto } from './create-study-session.dto';

// PartialType torna todos os campos de CreateStudySessionDto opcionais
export class UpdateStudySessionDto extends PartialType(CreateStudySessionDto) {}