import { ApiProperty } from '@nestjs/swagger';
import { Cities } from '@prisma/client';
import { Route } from 'api/types/route.type';
import { FlightDto } from './flight.dto';

export class RouteDto {
  @ApiProperty({ description: 'route origin city', enum: Cities })
  originCity: Cities;

  @ApiProperty({ description: 'route destination city', enum: Cities })
  destinationCity: Cities;

  @ApiProperty({ description: 'route travel time' })
  travelTime: number;

  @ApiProperty({ description: 'total price of all flights on a route' })
  price: number;

  @ApiProperty({ description: 'route stop amount' })
  stops: number;

  @ApiProperty({ description: 'route arrival time' })
  arrivalTime: number;

  @ApiProperty({ description: 'route departure time' })
  departureTime: number;

  @ApiProperty({ description: 'flights', isArray: true, type: FlightDto })
  flights: FlightDto[];

  static fromRoute(route?: Route) {
    if (!route.length) {
      return;
    }

    const it = new RouteDto();
    it.flights = FlightDto.fromEntities(route);
    const firstFlight = it.flights.at(0);
    const lastFlight = it.flights.at(-1);
    it.departureTime = firstFlight.departureTime;
    it.arrivalTime = lastFlight.arrivalTime;
    it.travelTime = it.arrivalTime - it.departureTime;
    it.originCity = firstFlight.originCity;
    it.destinationCity = lastFlight.destinationCity;
    it.price = route.reduce((prev, flight) => prev + flight.price, 0);
    it.stops = it.flights.length - 1;
    return it;
  }

  static fromRoutes(routes: Route[]) {
    return routes.map((route) => this.fromRoute(route));
  }
}
