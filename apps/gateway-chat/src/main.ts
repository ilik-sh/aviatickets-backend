import { NestFactory } from '@nestjs/core';
import { GatewayChatModule } from './gateway-chat.module';
import { RedisIoAdapter } from 'apps/gateway-chat/src/adapters/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayChatModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors();
  await app.listen(3002);
}
bootstrap();
