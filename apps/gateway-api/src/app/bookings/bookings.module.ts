import { Module } from '@nestjs/common';
import { BookingsRepo } from 'api/domain/repos/bookings.repo';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { FlightsRepo } from 'api/domain/repos/flights.repo';
import { PassengersRepo } from 'api/domain/repos/passengers.repo';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepo, FlightsRepo, PassengersRepo],
})
export class BookingsModule {}
