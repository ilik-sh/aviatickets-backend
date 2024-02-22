import { Module } from '@nestjs/common';
import { FlightGraphService } from './flight-graph.service';

@Module({
  providers: [FlightGraphService],
  exports: [FlightGraphService],
})
export class FlightGraphModule {}
