import { Device, Role, RoleTypes, User, UserPermissions } from '@prisma/client';
import { IsIn, IsUUID, IsString } from 'class-validator';

export class UserSessionDto {
  @IsUUID()
  id: string;

  @IsUUID()
  roleId: string;

  @IsString()
  name: string;

  @IsIn(Object.values(RoleTypes))
  roleType: RoleTypes;

  @IsUUID()
  deviceId: string;

  permissions: UserPermissions[];

  static from(session: UserSessionDto) {
    const it = new UserSessionDto();
    it.id = session.id;
    it.roleId = session.roleId;
    it.name = session.name;
    it.roleType = session.roleType;
    it.permissions = session.permissions;
    it.deviceId = session.deviceId;
    return it;
  }

  static toPlainObject(
    user: User & { role: Role },
    deviceId: Pick<Device, 'deviceId'>['deviceId'],
  ) {
    return {
      id: user.id,
      deviceId,
      name: user.firstName + ' ' + user.lastName,
      roleId: user.roleId,
      roleType: user.roleType,
      permissions: user.role.permissions,
    } as UserSessionDto;
  }
}
