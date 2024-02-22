import { Injectable } from '@nestjs/common';
import { Device, User } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class UserDeviceRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: string) {
    return await this.prisma.device.findUnique({
      where: { id },
    });
  }

  async findOneByUserIdAndDeviceId(
    user: Pick<User, 'id'>,
    device: Pick<Device, 'deviceId'>,
  ) {
    return await this.prisma.device.findUnique({
      where: {
        userId_deviceId: {
          deviceId: device.deviceId,
          userId: user.id,
        },
      },
    });
  }

  async createDevice(
    data: Pick<Device, 'deviceId' | 'hashedResetCode' | 'userId'>,
  ) {
    return await this.prisma.device.create({
      data: {
        deviceId: data.deviceId,
        hashedResetCode: data.hashedResetCode,
        userId: data.userId,
      },
    });
  }

  async deleteDevice(
    userId: Pick<User, 'id'>['id'],
    deviceId: Pick<Device, 'deviceId'>['deviceId'],
  ) {
    return await this.prisma.device.delete({
      where: {
        userId_deviceId: {
          deviceId,
          userId,
        },
      },
    });
  }

  async updateResetCode(id: string, code: string) {
    return await this.prisma.device.update({
      where: { id },
      data: {
        hashedResetCode: code,
      },
    });
  }
}
