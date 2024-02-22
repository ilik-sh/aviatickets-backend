import { Cities } from '@prisma/client';
import { IsEnum, IsNumber, ValidateNested, IsUUID } from 'class-validator';
import { PassengerDto } from 'api/domain/dto/passenger.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'booking price' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'origin city', enum: Cities })
  @IsEnum(Cities)
  originCity: Cities;

  @ApiProperty({ description: 'destination city', enum: Cities })
  @IsEnum(Cities)
  destinationCity: Cities;

  @ApiProperty({
    description: 'ids of flights that make up a route to a destination city',
    isArray: true,
    type: String,
  })
  @IsUUID(undefined, { each: true })
  toDestinationRoute: string[];

  @ApiProperty({
    description: 'ids of flights that make up a route to an origin city',
    isArray: true,
    type: String,
  })
  @IsUUID(undefined, { each: true })
  toOriginRoute: string[];

  @ApiProperty({
    description: 'passengers',
    isArray: true,
    type: PassengerDto,
  })
  @ValidateNested()
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}
