import {
  Booking,
  BookingStatuses,
  Cities,
  User,
  Flight,
  Passenger,
} from '@prisma/client';
import { UserDto } from './user.dto';
import { UUIDDto } from './uuid.dto';
import { FlightDto } from './flight.dto';
import { PassengerDto } from './passenger.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BookingDto extends UUIDDto {
  @ApiProperty({ description: 'booking status', enum: BookingStatuses })
  status: BookingStatuses;

  @ApiProperty({ description: 'booking price' })
  price: number;

  @ApiProperty({ description: 'user who made booking' })
  user: UserDto;

  @ApiProperty({ description: 'origin city', enum: Cities })
  originCity: Cities;

  @ApiProperty({ description: 'destination city', enum: Cities })
  destinationCity: Cities;

  @ApiProperty({ description: 'passengers', isArray: true, type: PassengerDto })
  passengers: PassengerDto[];

  @ApiProperty({
    description: 'flights that make up a route to a destination city',
    isArray: true,
    type: FlightDto,
  })
  toDestinationRoute: FlightDto[];

  @ApiProperty({
    description: 'flights that make up a route to an origin city',
    isArray: true,
    type: FlightDto,
  })
  toOriginRoute: FlightDto[];

  static fromEntity(
    entity?: Booking & { user?: User } & { toDestinationRoute?: Flight[] } & {
      toOriginRoute?: Flight[];
    } & { passengers?: Passenger[] },
  ) {
    if (!entity) {
      return;
    }

    const it = new BookingDto();
    it.id = entity.id;
    it.createdAt = entity.createdAt.valueOf();
    it.updatedAt = entity.updatedAt.valueOf();
    it.status = entity.status;
    it.price = entity.price;
    it.destinationCity = entity.destinationCity;
    it.originCity = entity.originCity;
    it.user = UserDto.fromEntity(entity.user);
    it.passengers = PassengerDto.fromEntities(entity.passengers);
    it.toDestinationRoute = FlightDto.fromEntities(entity.toDestinationRoute);
    it.toOriginRoute = FlightDto.fromEntities(entity.toOriginRoute);
    return it;
  }

  static fromEntities(entities?: Booking[]) {
    if (!entities?.map) {
      return;
    }

    return entities.map((entity) => this.fromEntity(entity));
  }
}
