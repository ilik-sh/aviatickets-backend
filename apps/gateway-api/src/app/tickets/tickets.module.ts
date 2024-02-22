import { Module } from '@nestjs/common';
import { FlightGraphModule } from 'api/libs/flight-graph/flight-graph.module';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [PrismaModule, FlightGraphModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
