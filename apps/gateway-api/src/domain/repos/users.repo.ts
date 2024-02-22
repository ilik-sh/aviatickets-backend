import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { GetUsersQueryDto } from 'api/app/users/domain/get-users-query.dto';
import { PrismaService } from 'libs/prisma/prisma.service';
import { UserIdentifier } from 'api/types/model-identifiers.types';

@Injectable()
export class UsersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers(query: GetUsersQueryDto) {
    const { pageNumber, pageSize } = query;

    const prismaQuery: Prisma.UserFindManyArgs = {
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    };

    const [count, users] = await Promise.all([
      this.prisma.user.count({ where: prismaQuery.where }),
      this.prisma.user.findMany(prismaQuery),
    ]);

    return { count, users };
  }

  async findOneById(user: UserIdentifier) {
    return await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        devices: true,
        role: true,
      },
    });
  }

  async findOneByEmail(user: Pick<User, 'email'>) {
    return await this.prisma.user.findUnique({
      where: { email: user.email },
      include: {
        devices: true,
        role: true,
      },
    });
  }

  async findOneByEmailAndPassword(
    email: Pick<User, 'email'>['email'],
    password: Pick<User, 'password'>['password'],
  ) {
    return await this.prisma.user.findUnique({
      where: { email, password },
      include: {
        role: true,
      },
    });
  }

  async createOne(
    user: Pick<
      User,
      'roleId' | 'roleType' | 'email' | 'password' | 'firstName' | 'lastName'
    >,
  ) {
    return await this.prisma.user.create({
      data: { ...user },
      include: {
        role: true,
      },
    });
  }

  async updateOne(
    userId: UserIdentifier,
    user: Pick<User, 'firstName' | 'lastName'>,
  ) {
    return await this.prisma.user.update({
      data: { ...user },
      where: { id: userId.id },
      include: { role: true },
    });
  }

  async resetPassword(resetData: Pick<User, 'email' | 'password'>) {
    return await this.prisma.user.update({
      where: { email: resetData.email },
      data: {
        password: resetData.password,
      },
      include: { role: true },
    });
  }

  async changePassword(data: Pick<User, 'id' | 'password'>) {
    return await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        password: data.password,
      },
    });
  }
}
