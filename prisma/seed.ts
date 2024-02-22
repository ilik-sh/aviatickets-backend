import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  Cities,
  FlightStatuses,
  Flight,
  Role,
  RoleTypes,
  UserPermissions,
  User,
} from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

type SeedFlight = Omit<Flight, 'id' | 'createdAt' | 'updatedAt'>;

function getRandomInt(leftBoundary: number, rightBoundary: number): number {
  const min = Math.ceil(leftBoundary);
  const max = Math.floor(rightBoundary);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function hashPassword(password: string) {
  const hash = crypto.createHash('MD5');
  return hash.update(password).digest('hex');
}

async function createFlights(quantity: number) {
  const cities = Object.values(Cities);
  const flights: SeedFlight[] = [];

  for (let i = 0; i < quantity; i++) {
    const departureTime = faker.date.soon({
      days: 10,
      refDate: '2024-01-24T00:00:00.000Z',
    });

    const arrivalTime = new Date(
      departureTime.getTime() + crypto.randomInt(1, 15) * 60 * 60 * 1000,
    );

    const originCityIndex = getRandomInt(0, cities.length - 1);
    let destinationCityIndex = getRandomInt(0, cities.length - 1);

    do {
      destinationCityIndex = getRandomInt(0, cities.length - 1);
    } while (destinationCityIndex === originCityIndex);

    const price = getRandomInt(10, 1000);
    const seatAmount = getRandomInt(10, 350);
    const availableSeatAmount = getRandomInt(1, seatAmount);

    const flight: SeedFlight = {
      originCity: cities[originCityIndex],
      destinationCity: cities[destinationCityIndex],
      departureTime,
      arrivalTime,
      status: FlightStatuses.Planned,
      price,
      seatAmount,
      availableSeatAmount,
    };

    flights.push(flight);
  }

  return prisma.flight.createMany({ data: flights });
}

type SeedRole = Pick<Role, 'permissions' | 'type'>;

async function createRoles() {
  const userRole: SeedRole = {
    type: RoleTypes.User,
    permissions: [
      UserPermissions.CreateBooking,
      UserPermissions.UpdateBooking,
      UserPermissions.GetAllUserBookings,
      UserPermissions.GetUser,
      UserPermissions.SignOut,
      UserPermissions.ChangePassword,
    ],
  };

  const adminRole: SeedRole = {
    type: RoleTypes.Admin,
    permissions: [
      UserPermissions.GetAllBookings,
      UserPermissions.UpdateBooking,
      UserPermissions.GetAllUsers,
      UserPermissions.GetUser,
      UserPermissions.UpdateUser,
      UserPermissions.SignOut,
      UserPermissions.ChangePassword,
    ],
  };

  const salesRole: SeedRole = {
    type: RoleTypes.Sales,
    permissions: [
      UserPermissions.GetUser,
      UserPermissions.SignOut,
      UserPermissions.ChangePassword,
    ],
  };

  const roles = [userRole, adminRole, salesRole];

  return prisma.role.createMany({ data: roles });
}

type SeedUser = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'password' | 'roleId' | 'roleType'
>;
async function createDefaultUsers() {
  const [adminRole, salesRole] = await Promise.all([
    prisma.role.findFirst({ where: { type: RoleTypes.Admin } }),
    prisma.role.findFirst({ where: { type: RoleTypes.Sales } }),
  ]);

  const admin: SeedUser = {
    firstName: 'Andrew',
    lastName: 'Dollar',
    email: 'andrew.admin@gmail.com',
    password: await hashPassword('wsssA+f2'),
    roleType: RoleTypes.Admin,
    roleId: adminRole.id,
  };
  const sales1: SeedUser = {
    firstName: 'Mary',
    lastName: 'Gonzales',
    email: 'mary.sales@gmail.com',
    password: await hashPassword('wsssA+f2'),
    roleType: RoleTypes.Sales,
    roleId: salesRole.id,
  };
  const sales2: SeedUser = {
    firstName: 'Donna',
    lastName: 'Powell',
    email: 'donna.sales@gmail.com',
    password: await hashPassword('wsssA+f2'),
    roleType: RoleTypes.Sales,
    roleId: salesRole.id,
  };

  const users = [admin, sales1, sales2];

  return prisma.user.createMany({ data: users });
}

async function main() {
  await Promise.all([createFlights(200), createRoles(), createDefaultUsers()]);
}

main()
  .catch((e) => console.log(e))
  .finally(async () => {
    prisma.$disconnect;
  });
