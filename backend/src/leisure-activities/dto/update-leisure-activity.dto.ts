import { PartialType } from '@nestjs/mapped-types';
import { CreateLeisureActivityDto } from './create-leisure-activity.dto';

export class UpdateLeisureActivityDto extends PartialType(CreateLeisureActivityDto) {}