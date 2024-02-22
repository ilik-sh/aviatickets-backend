import { Cities } from '@prisma/client';
import { RemoveExtraSpaces } from 'api/decorators/remove-extra-spaces.decorator';
import { PaginationQueryDto } from 'api/domain/dto/pagination-query.dto';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger/dist';

export enum PassengerAmount {
  Min = 1,
  Max = 10,
}

export class GetTicketsQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'origin city', enum: Cities })
  @IsEnum(Cities)
  @RemoveExtraSpaces()
  originCity: Cities;

  @ApiProperty({ description: 'destination city', enum: Cities })
  @IsEnum(Cities)
  @RemoveExtraSpaces()
  destinationCity: Cities;

  @ApiProperty({ description: 'departure time' })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @Type(() => Date)
  @RemoveExtraSpaces()
  departureTime: Date;

  @ApiPropertyOptional({ description: 'arrival time' })
  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @Type(() => Date)
  @RemoveExtraSpaces()
  arrivalTime?: Date;

  @ApiProperty({ description: 'passenger amount' })
  @Max(PassengerAmount.Max)
  @Min(PassengerAmount.Min)
  @Transform(({ value }) => Number(value))
  passengerAmount: number;
}
