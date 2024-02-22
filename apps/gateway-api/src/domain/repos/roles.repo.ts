import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'libs/prisma/prisma.service';

@Injectable()
export class RolesRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByType(type: Pick<Role, 'type'>['type']) {
    return await this.prisma.role.findFirst({
      where: { type },
    });
  }
}
