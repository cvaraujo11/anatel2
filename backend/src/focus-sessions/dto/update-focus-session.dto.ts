import { PartialType } from '@nestjs/mapped-types';
import { CreateFocusSessionDto } from './create-focus-session.dto';

export class UpdateFocusSessionDto extends PartialType(CreateFocusSessionDto) {}