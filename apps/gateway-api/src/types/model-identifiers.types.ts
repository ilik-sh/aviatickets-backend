import { Booking, User } from '@prisma/client';

export type UserIdentifier = Pick<User, 'id'>;
export type BookingIdentifier = Pick<Booking, 'id'>;
