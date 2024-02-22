import { Injectable } from '@nestjs/common';
import { Device, Role, RoleTypes, User } from '@prisma/client';
import { RolesRepo } from 'api/domain/repos/roles.repo';
import { UsersRepo } from 'api/domain/repos/users.repo';
import { ErrorMessage } from 'api/enums/error-message.enum';
import { SecurityService } from 'libs/security/security.service';
import { MailerService } from 'api/libs/mailer/mailer.service';
import { UserDeviceRepo } from 'api/domain/repos/user-device.repo';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { UserIdentifier } from 'api/types/model-identifiers.types';
import { UserResetTokenDto } from 'api/domain/dto/user-reset-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly rolesRepo: RolesRepo,
    private readonly devicesRepo: UserDeviceRepo,
    private readonly securityService: SecurityService,
    private readonly mailerService: MailerService,
  ) {}

  async findUserByEmail(user: Pick<User, 'email'>) {
    return await this.usersRepo.findOneByEmail(user);
  }

  async findUserById(user: UserIdentifier) {
    return await this.usersRepo.findOneById(user);
  }

  async findUserByEmailAndPassword(user: Pick<User, 'email' | 'password'>) {
    const hashedPassword = await this.securityService.hashPassword(
      user.password,
    );

    return this.usersRepo.findOneByEmailAndPassword(user.email, hashedPassword);
  }

  async findDeviceByUserIdAndDeviceId(
    user: Pick<User, 'id'>,
    device: Pick<Device, 'deviceId'>,
  ) {
    return await this.devicesRepo.findOneByUserIdAndDeviceId(user, device);
  }

  async makeNewUser(
    user: Pick<User, 'email' | 'password' | 'firstName' | 'lastName'>,
  ) {
    const role = await this.rolesRepo.findOneByType(RoleTypes.User);
    if (!role) {
      return;
    }

    const hashedPassword = await this.securityService.hashPassword(
      user.password,
    );

    return await this.usersRepo.createOne({
      roleId: role.id,
      roleType: role.type,
      email: user.email,
      password: hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  async authenticate(
    user: User & { role: Role },
    device: Pick<Device, 'deviceId'>,
  ) {
    const tokens = this.securityService.generateTokens(user, device);

    await this.createDevice(user, device, null);

    return tokens;
  }

  async signout(user: UserSessionDto) {
    return await this.devicesRepo.deleteDevice(user.id, user.deviceId);
  }

  generateResetToken(user: Pick<User, 'id'>, device: Pick<Device, 'deviceId'>) {
    return this.securityService.generateResetToken(user, device);
  }

  generateResetCode(): number {
    return this.securityService.generateResetCode();
  }

  hashResetCode(resetCode: number): string {
    return this.securityService.hashResetCode(resetCode);
  }

  async sendResetCodeToUserByEmail(
    user: Pick<User, 'email'>,
    resetCode: number,
  ) {
    return await this.mailerService.sendEmail(user.email, resetCode);
  }

  async createDevice(
    user: Pick<User, 'email'>,
    device: Pick<Device, 'deviceId'>,
    resetCode: Pick<Device, 'hashedResetCode'>['hashedResetCode'],
  ) {
    const userEntity = await this.usersRepo.findOneByEmail(user);
    if (!userEntity) {
      throw new Error(ErrorMessage.UserNotExists);
    }

    const deviceEntity = await this.devicesRepo.findOneByUserIdAndDeviceId(
      userEntity,
      device,
    );

    if (deviceEntity) {
      await this.devicesRepo.updateResetCode(deviceEntity.id, resetCode);
      return deviceEntity;
    }

    const deviceData: Pick<Device, 'deviceId' | 'hashedResetCode' | 'userId'> =
      {
        deviceId: device.deviceId,
        hashedResetCode: resetCode,
        userId: userEntity.id,
      };

    return await this.devicesRepo.createDevice(deviceData);
  }

  async verifyUserResetCode(user: UserResetTokenDto, code: number) {
    const userEntity = await this.usersRepo.findOneById(user);
    const device = { deviceId: user.deviceId };
    const deviceEntity = await this.devicesRepo.findOneByUserIdAndDeviceId(
      user,
      device,
    );
    const hashedResetCode = this.securityService.hashResetCode(code);

    if (deviceEntity.hashedResetCode !== hashedResetCode) {
      return null;
    }

    const resetToken = this.securityService.generateResetToken(
      userEntity,
      deviceEntity,
      hashedResetCode,
    );

    return resetToken;
  }

  async resetPassword(password: Pick<User, 'password'>, resetToken: string) {
    const { decodedToken, isValid } = this.securityService.decodeResetToken(
      resetToken.split(' ')[1],
    );

    const user = await this.usersRepo.findOneById(decodedToken.userId);

    const deviceData = user.devices.find(
      (device) => device.deviceId === decodedToken.deviceId,
    );

    if (decodedToken.hashedResetCode !== deviceData.hashedResetCode) {
      throw new Error(ErrorMessage.BadVerification);
    }

    if (!deviceData) {
      throw new Error(ErrorMessage.NotAuthorizedDevice);
    }

    if (!isValid) {
      throw new Error(ErrorMessage.BadResetToken);
    }

    const hashedPassword = await this.securityService.hashPassword(
      password.password,
    );

    const resetData: Pick<User, 'email' | 'password'> = {
      email: user.email,
      password: hashedPassword,
    };

    await this.devicesRepo.deleteDevice(user.id, deviceData.deviceId);

    return await this.usersRepo.resetPassword(resetData);
  }

  async resetUserPassword(
    user: UserResetTokenDto,
    userData: Pick<User, 'password'>,
  ) {
    const userEntity = await this.usersRepo.findOneById(user);

    const device = userEntity.devices.find(
      (device) => device.deviceId === user.deviceId,
    );

    if (user.hashedResetCode !== device.hashedResetCode) {
      throw new Error(ErrorMessage.BadVerification);
    }

    if (!device) {
      throw new Error(ErrorMessage.NotAuthorizedDevice);
    }

    const hashedPassword = await this.securityService.hashPassword(
      userData.password,
    );

    const resetData: Pick<User, 'email' | 'password'> = {
      email: userEntity.email,
      password: hashedPassword,
    };

    await this.devicesRepo.deleteDevice(user.id, device.deviceId);

    return await this.usersRepo.resetPassword(resetData);
  }

  async changePassword(
    userData: UserSessionDto,
    changeData: {
      oldPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
  ) {
    const user = await this.usersRepo.findOneById(userData);
    if (
      user.password ===
      (await this.securityService.hashPassword(changeData.oldPassword))
    ) {
      const password = await this.securityService.hashPassword(
        changeData.newPassword,
      );
      const newData: Pick<User, 'id' | 'password'> = {
        id: user.id,
        password: password,
      };
      return this.usersRepo.changePassword(newData);
    }
    return null;
  }
}
