import { PartialType } from '@nestjs/mapped-types';
import { CreateMoodFactorDto } from './create-mood-factor.dto';
import { IsOptional, IsUUID } from 'class-validator';

// Remove moodEntryId from the base DTO for update
class CreateMoodFactorDtoWithoutEntry extends CreateMoodFactorDto {
    moodEntryId: never; // Explicitly remove or mark as never
}


export class UpdateMoodFactorDto extends PartialType(CreateMoodFactorDtoWithoutEntry) {
    // moodEntryId cannot be updated via this DTO.
    // The service logic prevents changing the association.

    // We can re-add moodEntryId here as optional if we want to allow changing it,
    // but the current service logic prevents it.
    // @IsOptional()
    // @IsUUID()
    // moodEntryId?: string;
}