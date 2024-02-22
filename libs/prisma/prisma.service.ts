import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FlightGraphService } from '../../apps/gateway-api/src/libs/flight-graph/flight-graph.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly flightGraphService: FlightGraphService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    const flights = await this.flight.findMany();
    this.flightGraphService.buildGraph(flights);
  }
}
