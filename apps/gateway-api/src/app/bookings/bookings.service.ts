import { Injectable } from '@nestjs/common';
import { BookingsRepo } from 'api/domain/repos/bookings.repo';
import { GetAllBookingsQueryDto } from './domain/get-all-bookings-query.dto';
import { Booking, Passenger, User } from '@prisma/client';
import { PassengersRepo } from 'api/domain/repos/passengers.repo';
import { FlightsRepo } from 'api/domain/repos/flights.repo';
import { CreateBookingDto } from 'api/domain/dto/create-booking.dto';
import { BookingIdentifier } from 'api/types/model-identifiers.types';
import { xorBy } from 'lodash';

@Injectable()
export class BookingsService {
  constructor(
    private bookingsRepo: BookingsRepo,
    private passengerRepo: PassengersRepo,
    private flightRepo: FlightsRepo,
  ) {}

  async findAllBookings(query: GetAllBookingsQueryDto) {
    return await this.bookingsRepo.findAllBookings(query);
  }

  async findFlightsByIds(flightIds: string[]) {
    return await this.flightRepo.findFlightByIds(flightIds);
  }

  async findBookingById(booking: BookingIdentifier) {
    return await this.bookingsRepo.findOneById(booking);
  }

  async updateBooking(
    bookingId: BookingIdentifier,
    booking: Pick<Booking, 'status'>,
  ) {
    return await this.bookingsRepo.updateOne(bookingId, booking);
  }

  async decreaseFlightsAvailableSeatsAmount(
    flightIds: string[],
    amount: number,
  ) {
    return await this.flightRepo.decreaseFlightSeatAmount(flightIds, amount);
  }

  async createBooking(user: Pick<User, 'id'>, booking: CreateBookingDto) {
    return await this.bookingsRepo.createBooking(user, booking);
  }

  async findNonexistentPassengers(
    passengers: Pick<Passenger, 'lastName' | 'firstName' | 'passportId'>[],
  ) {
    const passengerPassportIds = passengers.map(
      (passenger) => passenger.passportId,
    );

    const passengerEntities =
      await this.passengerRepo.findPassengersByPassportIds(
        passengerPassportIds,
      );

    return xorBy(passengers, passengerEntities, 'passportId');
  }

  async createPassengers(
    passengers: Pick<Passenger, 'lastName' | 'firstName' | 'passportId'>[],
  ) {
    return await this.passengerRepo.createPassengers(passengers);
  }
}
