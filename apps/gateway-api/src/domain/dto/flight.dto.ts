import { Cities, Flight, FlightStatuses } from '@prisma/client';
import { UUIDDto } from './uuid.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FlightDto extends UUIDDto {
  @ApiProperty({ description: 'origin city', enum: Cities })
  originCity: Cities;

  @ApiProperty({ description: 'destination city', enum: Cities })
  destinationCity: Cities;

  @ApiProperty({ description: 'flight departure time' })
  departureTime: number;

  @ApiProperty({ description: 'flight arrival time' })
  arrivalTime: number;

  @ApiProperty({ description: 'flight time' })
  flightTime: number;

  @ApiProperty({ description: 'flight statuses', enum: FlightStatuses })
  status: FlightStatuses;

  @ApiProperty({ description: 'flight price' })
  price: number;

  @ApiProperty({ description: 'total amount of seats on a flight' })
  seatAmount: number;

  @ApiProperty({ description: 'amount of remaining seats on a flight' })
  availableSeatAmount: number;

  static fromEntity(entity?: Flight) {
    if (!entity) {
      return;
    }

    const it = new FlightDto();
    it.id = entity.id;
    it.createdAt = entity.createdAt.valueOf();
    it.updatedAt = entity.updatedAt.valueOf();
    it.originCity = entity.originCity;
    it.destinationCity = entity.destinationCity;
    it.arrivalTime = entity.arrivalTime.valueOf();
    it.departureTime = entity.departureTime.valueOf();
    it.flightTime = it.arrivalTime - it.departureTime;
    it.status = entity.status;
    it.price = entity.price;
    it.seatAmount = entity.seatAmount;
    it.availableSeatAmount = entity.availableSeatAmount;
    return it;
  }

  static fromEntities(entities?: Flight[]) {
    if (!entities?.map) {
      return;
    }

    return entities.map((entity) => this.fromEntity(entity));
  }
}
