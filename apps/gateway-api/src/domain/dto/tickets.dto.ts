import { ApiProperty } from '@nestjs/swagger';
import { JourneyTypes } from 'api/enums/journey-types.enum';
import { PaginationQueryDto } from './pagination-query.dto';
import { RouteDto } from './route.dto';
import { TicketDto } from './ticket.dto';

export class TicketsDto {
  @ApiProperty({ description: 'total number of tickets' })
  count: number;

  @ApiProperty({ description: 'bookings', isArray: true, type: TicketDto })
  tickets: TicketDto[];

  static fromRoutes(
    toDestinationRoutes: RouteDto[],
    toOriginRoutes: RouteDto[] = [],
    journeyType: JourneyTypes,
    paginationOptions: PaginationQueryDto,
  ) {
    const toDestinationRouteAmount = toDestinationRoutes.length;
    const toOriginRouteAmount = toOriginRoutes.length;

    const oneOfRouteArraysIsEmpty =
      !toDestinationRouteAmount || !toOriginRouteAmount;

    if (
      (journeyType === JourneyTypes.RoundTrip && oneOfRouteArraysIsEmpty) ||
      (journeyType === JourneyTypes.OneWay && !toDestinationRouteAmount)
    ) {
      const it = new TicketsDto();
      it.count = 0;
      it.tickets = [];
      return it;
    }

    if (journeyType === JourneyTypes.OneWay) {
      const it = new TicketsDto();
      it.count = toDestinationRouteAmount;
      const tickets = TicketDto.fromRoutes(toDestinationRoutes);
      it.tickets = paginateArray(tickets, paginationOptions);
      return it;
    }

    const it = new TicketsDto();
    it.count = toDestinationRouteAmount * toOriginRouteAmount;
    const tickets = TicketDto.fromRoutes(toDestinationRoutes, toOriginRoutes);
    it.tickets = paginateArray(tickets, paginationOptions);

    return it;
  }
}

const paginateArray = (array: any[], paginationOptions: PaginationQueryDto) => {
  const { pageNumber, pageSize } = paginationOptions;
  const arrayChunk = array.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize,
  );
  return arrayChunk;
};
