import { Injectable } from '@nestjs/common';
import { Booking, User, Prisma } from '@prisma/client';
import { GetAllBookingsQueryDto } from 'api/app/bookings/domain/get-all-bookings-query.dto';
import { GetAllUserBookingsQueryDto } from 'api/app/users/domain/get-all-user-bookings.dto';
import { PrismaService } from 'libs/prisma/prisma.service';
import {
  BookingIdentifier,
  UserIdentifier,
} from 'api/types/model-identifiers.types';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findAllBookings(query: GetAllBookingsQueryDto) {
    const { pageNumber, pageSize } = query;

    const prismaQuery: Prisma.BookingFindManyArgs = {
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        toOriginRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        toDestinationRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        passengers: true,
        user: true,
      },
    };

    const [count, bookings] = await Promise.all([
      this.prisma.booking.count({ where: prismaQuery.where }),
      this.prisma.booking.findMany(prismaQuery),
    ]);

    return { count, bookings };
  }

  async findAllUserBookings(
    user: UserIdentifier,
    query: GetAllUserBookingsQueryDto,
  ) {
    const { pageNumber, pageSize } = query;

    const prismaQuery: Prisma.BookingFindManyArgs = {
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        toOriginRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        toDestinationRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        passengers: true,
        user: true,
      },
      where: {
        userId: user.id,
      },
    };

    const [count, bookings] = await Promise.all([
      this.prisma.booking.count({ where: prismaQuery.where }),
      this.prisma.booking.findMany(prismaQuery),
    ]);

    return { count, bookings };
  }

  async findOneById(booking: BookingIdentifier) {
    return await this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        toOriginRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        toDestinationRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        passengers: true,
        user: true,
      },
    });
  }

  async createBooking(user: Pick<User, 'id'>, booking: CreateBookingDto) {
    return await this.prisma.booking.create({
      data: {
        ...booking,
        toDestinationRoute: {
          connect: booking.toDestinationRoute.map((id) => ({ id: id })),
        },
        toOriginRoute: {
          connect: booking.toOriginRoute.map((id) => ({ id: id })),
        },
        passengers: {
          connect: booking.passengers.map((passenger) => ({
            passportId: passenger.passportId,
          })),
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        toOriginRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        toDestinationRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        passengers: true,
        user: true,
      },
    });
  }

  async updateOne(
    bookingId: BookingIdentifier,
    booking: Pick<Booking, 'status'>,
  ) {
    return await this.prisma.booking.update({
      where: { id: bookingId.id },
      data: { status: booking.status },
      include: {
        toOriginRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        toDestinationRoute: {
          orderBy: {
            departureTime: 'asc',
          },
        },
        passengers: true,
        user: true,
      },
    });
  }
}
