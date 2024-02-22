import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class FlightsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findFlightByIds(flightIds: string[]) {
    return await this.prisma.flight.findMany({
      where: {
        id: { in: flightIds },
      },
    });
  }

  async decreaseFlightSeatAmount(flightIds: string[], amount: number) {
    await this.prisma.$transaction(
      async (tx) => {
        await tx.flight.updateMany({
          where: {
            id: { in: flightIds },
          },
          data: {
            availableSeatAmount: {
              decrement: amount,
            },
          },
        });

        const flights = await tx.flight.findMany({
          where: {
            id: { in: flightIds },
          },
        });

        flights.map((flight) => {
          if (flight.availableSeatAmount < 0) {
            throw new PrismaClientKnownRequestError(
              `Insufficient seats on flight: ${flight.originCity} - ${flight.destinationCity}`,
              { code: '500', clientVersion: 'latest' },
            );
          }
        });
      },
      { isolationLevel: 'Serializable' },
    );
    return true;
  }
}
