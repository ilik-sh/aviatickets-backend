import { Module } from '@nestjs/common';
import { FlightGraphModule } from '../../apps/gateway-api/src/libs/flight-graph/flight-graph.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [FlightGraphModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
