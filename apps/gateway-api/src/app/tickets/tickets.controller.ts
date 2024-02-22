import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TicketsDto } from 'api/domain/dto/tickets.dto';
import { GetTicketsQueryDto } from './domain/get-tickets-query.dto';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: TicketsDto,
  })
  @Get()
  async getAllTickets(@Query() query: GetTicketsQueryDto) {
    const routes = await this.ticketsService.findRoutes(query);
    return TicketsDto.fromRoutes(
      routes.toDestinationRoutesDto,
      routes.toOriginRoutesDto,
      routes.journeyType,
      query,
    );
  }
}
