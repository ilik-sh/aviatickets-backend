import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsDto } from 'api/domain/dto/bookings.dto';
import { JwtPermissionsGuard } from 'libs/security/guards/jwt-permissions.guard';
import { BookingsService } from './bookings.service';
import { GetAllBookingsQueryDto } from './domain/get-all-bookings-query.dto';
import { UpdateBookingForm } from './domain/update-booking.form';
import { ErrorMessage } from 'api/enums/error-message.enum';
import { BookingDto } from 'api/domain/dto/booking.dto';
import { CreateBookingForm } from './domain/create-booking.form';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { RequirePermissions } from 'libs/security/decorators/require-permissions.decorator';
import { UserPermissions } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common/enums';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings of all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BookingsDto,
  })
  @Get()
  @RequirePermissions(UserPermissions.GetAllBookings)
  @UseGuards(JwtPermissionsGuard)
  async getAllBookings(@Query() query: GetAllBookingsQueryDto) {
    const bookingsWithCount = await this.bookingsService.findAllBookings(query);
    return BookingsDto.fromResponse(bookingsWithCount);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a booking' })
  @ApiBody({ type: CreateBookingForm })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
    type: BookingDto,
  })
  @Post()
  @RequirePermissions(UserPermissions.CreateBooking)
  @UseGuards(JwtPermissionsGuard)
  async createBooking(
    @Body() form: CreateBookingForm,
    @CurrentUser() user: UserSessionDto,
  ) {
    const toDestinationFlightIds = form.toDestinationRoute;
    const toOriginFlightIds = form.toOriginRoute;

    const [toDestinationFlights, toOriginFlights] = await Promise.all([
      this.bookingsService.findFlightsByIds(toDestinationFlightIds),
      this.bookingsService.findFlightsByIds(toOriginFlightIds),
    ]);

    const someToDestinationFlightsNotFound =
      toDestinationFlightIds.length !== toDestinationFlights.length;

    const someToOriginFlightsNotFound =
      toOriginFlightIds.length !== toOriginFlights.length;

    if (someToDestinationFlightsNotFound || someToOriginFlightsNotFound) {
      throw new InternalServerErrorException(ErrorMessage.RecordNotExists);
    }

    const passengersToCreate =
      await this.bookingsService.findNonexistentPassengers(form.passengers);

    const createdPassengerEntities =
      await this.bookingsService.createPassengers(passengersToCreate);

    if (!createdPassengerEntities) {
      throw new InternalServerErrorException(ErrorMessage.RecordCreationFailed);
    }

    const enoughAvailableSeats =
      await this.bookingsService.decreaseFlightsAvailableSeatsAmount(
        [...toDestinationFlightIds, ...toOriginFlightIds],
        form.passengers.length,
      );

    if (!enoughAvailableSeats) {
      throw new InternalServerErrorException(
        ErrorMessage.NotEnoughAvailableSeats,
      );
    }

    const bookingEntity = await this.bookingsService.createBooking(user, form);
    if (!bookingEntity) {
      throw new InternalServerErrorException(ErrorMessage.RecordCreationFailed);
    }

    return BookingDto.fromEntity(bookingEntity);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking' })
  @ApiBody({ type: UpdateBookingForm })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BookingDto,
  })
  @Put(':bookingId')
  @RequirePermissions(UserPermissions.UpdateBooking)
  @UseGuards(JwtPermissionsGuard)
  async updateBooking(
    @Param('bookingId') bookingId: string,
    @Body() form: UpdateBookingForm,
  ) {
    const booking = { id: bookingId };
    const bookingEntity = await this.bookingsService.findBookingById(booking);
    if (!bookingEntity) {
      throw new InternalServerErrorException(ErrorMessage.RecordNotFound);
    }

    const updatedBookingEntity = await this.bookingsService.updateBooking(
      booking,
      form,
    );
    if (!updatedBookingEntity) {
      throw new InternalServerErrorException(ErrorMessage.RecordUpdationFailed);
    }

    return BookingDto.fromEntity(updatedBookingEntity);
  }
}
