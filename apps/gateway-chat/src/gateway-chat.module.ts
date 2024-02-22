import { Module } from '@nestjs/common';
import { GatewayChatController } from 'chat/gateway-chat.controller';
import { GatewayChatService } from 'chat/gateway-chat.service';
import { SocketModule } from 'chat/socket/socket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from 'chat/config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [redisConfig],
      isGlobal: true,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        socket: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
        },

        ttl: config.get('redis.ttl'),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    SocketModule,
  ],
  controllers: [GatewayChatController],
  providers: [GatewayChatService],
})
export class GatewayChatModule {}
