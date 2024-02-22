import { Module } from '@nestjs/common';
import { BookingsRepo } from 'api/domain/repos/bookings.repo';
import { UsersRepo } from 'api/domain/repos/users.repo';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepo, BookingsRepo],
})
export class UsersModule {}
