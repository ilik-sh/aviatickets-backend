import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { MessageDto } from 'chat/dtos/message.dto';
import { RoomDto } from 'chat/dtos/room.dto';
import { UserInfoDto } from 'chat/dtos/user.dto';

@Injectable()
export class SocketService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getUser(user: Pick<UserInfoDto, 'id'>): Promise<UserInfoDto> {
    return await this.cacheManager.get(user.id);
  }

  async getRoom(roomId: string): Promise<RoomDto> {
    return await this.cacheManager.get(roomId);
  }

  async setUser(user: UserInfoDto, socketId: string) {
    const userInfo = {
      name: user.name,
      roleType: user.roleType,
      socketId: socketId,
      rooms: [],
    };
    return await this.cacheManager.set(user.id, userInfo);
  }

  async createRoom(roomId: string, messages: MessageDto[], userIds: string[]) {
    this.cacheManager.set(roomId, { messages: messages, users: userIds });
  }

  async createRoomWithoutExpiry(
    roomId: string,
    messages: MessageDto[],
    userIds: string[],
  ) {
    this.cacheManager.set(roomId, { messages: messages, users: userIds }, 0);
  }

  async updateRoom(roomId: string, socketId: string) {
    const existingRoom = await this.cacheManager.get(roomId);
  }

  async setUserSocket(user: Pick<UserInfoDto, 'id'>, socketId: string) {
    const existingUser = await this.getUser(user);
    return await this.cacheManager.set(user.id, {
      ...existingUser,
      socketId: socketId,
    });
  }

  async leaveRoom(user: Pick<UserInfoDto, 'id'>, roomId: string, ttl?: number) {
    const existingRoom = await this.getRoom(roomId);
    const userIndex = existingRoom.users.indexOf(user.id);
    const roomUsers = existingRoom.users.filter((item) => item !== user.id);
    await this.cacheManager.set(
      roomId,
      { ...existingRoom, users: roomUsers },
      ttl,
    );
  }

  async saveRoomEntry(
    user: Pick<UserInfoDto, 'id'>,
    roomId: string,
    ttl?: number,
  ) {
    const existingRoom = await this.getRoom(roomId);
    const roomUsers = existingRoom.users;
    roomUsers.push(user.id);
    await this.cacheManager.set(
      roomId,
      { ...existingRoom, users: roomUsers },
      ttl,
    );
  }

  async saveMessage(roomId: string, message: MessageDto, ttl?: number) {
    console.log(roomId);
    const existingRoom = await this.getRoom(roomId);
    const roomMessages = existingRoom.messages;
    roomMessages.push(message);
    await this.cacheManager.set(
      roomId,
      { ...existingRoom, messages: roomMessages },
      ttl,
    );
  }
}
