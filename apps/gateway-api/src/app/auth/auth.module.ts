import { Module } from '@nestjs/common';
import { RolesRepo } from 'api/domain/repos/roles.repo';
import { UsersRepo } from 'api/domain/repos/users.repo';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { SecurityModule } from 'libs/security/security.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from 'api/libs/mailer/mailer.module';
import { UserDeviceRepo } from 'api/domain/repos/user-device.repo';

@Module({
  imports: [SecurityModule, PrismaModule, MailerModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepo, RolesRepo, UserDeviceRepo],
})
export class AuthModule {}
