import { Injectable } from '@nestjs/common';
import { Passenger } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class PassengersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findPassengersByPassportIds(passportIds: string[]) {
    return await this.prisma.passenger.findMany({
      where: {
        passportId: { in: passportIds },
      },
    });
  }

  async findOneByPassport(passenger: Pick<Passenger, 'passportId'>) {
    return await this.prisma.passenger.findUnique({
      where: {
        passportId: passenger.passportId,
      },
    });
  }

  async createPassengers(
    passengers: Pick<Passenger, 'lastName' | 'firstName' | 'passportId'>[],
  ) {
    return await this.prisma.passenger.createMany({
      data: passengers,
    });
  }
}
