import { Module } from '@nestjs/common';
import { SocketService } from 'chat/socket/socket.service';
import { SocketGateway } from 'chat/socket/socket.gateway';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [SocketService, SocketGateway],
})
export class SocketModule {}
