import { PartialType } from '@nestjs/mapped-types';
import { CreateLeisureSessionDto } from './create-leisure-session.dto';

export class UpdateLeisureSessionDto extends PartialType(CreateLeisureSessionDto) {}