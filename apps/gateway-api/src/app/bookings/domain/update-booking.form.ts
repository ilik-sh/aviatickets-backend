import { ApiProperty } from '@nestjs/swagger';
import { BookingStatuses } from '@prisma/client';
import { RemoveExtraSpaces } from 'api/decorators/remove-extra-spaces.decorator';
import { IsEnum } from 'class-validator';

export class UpdateBookingForm {
  @ApiProperty({
    description: 'booking status',
    enum: BookingStatuses,
  })
  @IsEnum(BookingStatuses)
  @RemoveExtraSpaces()
  status: BookingStatuses;
}
