-- CreateEnum
CREATE TYPE "UserPermissions" AS ENUM ('permissions.all', 'permissions.bookings.get-all-bookings', 'permissions.bookings.create-booking', 'permissions.bookings.update-booking', 'permissions.users.get-all-users', 'permissions.users.get-all-user-bookings', 'permissions.users.get-user', 'permissions.users.update-user', 'permissions.auth.sign-out', 'permissions.auth.change-password');

-- CreateEnum
CREATE TYPE "RoleTypes" AS ENUM ('admin', 'user', 'sales');

-- CreateEnum
CREATE TYPE "FlightStatuses" AS ENUM ('planned', 'completed');

-- CreateEnum
CREATE TYPE "BookingStatuses" AS ENUM ('payed', 'booked', 'cancelled');

-- CreateEnum
CREATE TYPE "Cities" AS ENUM ('Bridgetown', 'Minsk', 'Brussels', 'Sofia', 'Brazzaville', 'Prague', 'Helsinki', 'Paris', 'Tbilisi', 'Berlin', 'Bissau', 'Valletta', 'Monaco', 'Warsaw', 'Lisbon', 'Bucharest');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "RoleTypes" NOT NULL,
    "permissions" "UserPermissions"[],

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "hashedResetCode" TEXT,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role_type" "RoleTypes" NOT NULL DEFAULT 'user',
    "password" TEXT NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatuses" NOT NULL DEFAULT 'booked',
    "price" INTEGER NOT NULL,
    "originCity" "Cities" NOT NULL,
    "destinationCity" "Cities" NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "passport_id" TEXT NOT NULL,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "origin_city" "Cities" NOT NULL,
    "destination_city" "Cities" NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "status" "FlightStatuses" NOT NULL,
    "price" INTEGER NOT NULL,
    "seat_amount" INTEGER NOT NULL,
    "available_seat_amount" INTEGER NOT NULL,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_booking_to_flight_destination" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_booking_to_flight_origin" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_booking_to_passenger" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_type_key" ON "roles"("id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "devices_user_id_device_id_key" ON "devices"("user_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_password_idx" ON "users"("email", "password");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_passport_id_key" ON "passengers"("passport_id");

-- CreateIndex
CREATE UNIQUE INDEX "_booking_to_flight_destination_AB_unique" ON "_booking_to_flight_destination"("A", "B");

-- CreateIndex
CREATE INDEX "_booking_to_flight_destination_B_index" ON "_booking_to_flight_destination"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_booking_to_flight_origin_AB_unique" ON "_booking_to_flight_origin"("A", "B");

-- CreateIndex
CREATE INDEX "_booking_to_flight_origin_B_index" ON "_booking_to_flight_origin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_booking_to_passenger_AB_unique" ON "_booking_to_passenger"("A", "B");

-- CreateIndex
CREATE INDEX "_booking_to_passenger_B_index" ON "_booking_to_passenger"("B");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_booking_to_flight_destination" ADD CONSTRAINT "_booking_to_flight_destination_A_fkey" FOREIGN KEY ("A") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_booking_to_flight_destination" ADD CONSTRAINT "_booking_to_flight_destination_B_fkey" FOREIGN KEY ("B") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_booking_to_flight_origin" ADD CONSTRAINT "_booking_to_flight_origin_A_fkey" FOREIGN KEY ("A") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_booking_to_flight_origin" ADD CONSTRAINT "_booking_to_flight_origin_B_fkey" FOREIGN KEY ("B") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_booking_to_passenger" ADD CONSTRAINT "_booking_to_passenger_A_fkey" FOREIGN KEY ("A") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_booking_to_passenger" ADD CONSTRAINT "_booking_to_passenger_B_fkey" FOREIGN KEY ("B") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
