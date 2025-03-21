import { Module } from '@nestjs/common';

import { RedisClientService } from './redis-client.service';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisClientService, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
