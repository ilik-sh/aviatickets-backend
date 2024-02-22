import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserDto } from './user.dto';

interface UsersAndCount {
  count: number;
  users: User[];
}

export class UsersDto {
  @ApiProperty({ description: 'total number of users' })
  count: number;

  @ApiProperty({ description: 'users', isArray: true, type: UserDto })
  users: UserDto[];

  static fromResponse({ count, users }: UsersAndCount) {
    const it = new UsersDto();
    it.count = count;
    it.users = UserDto.fromEntities(users);
    return it;
  }
}
