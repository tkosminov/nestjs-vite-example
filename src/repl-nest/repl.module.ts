import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { RedisModule } from '../redis/redis.module';
import { TypeOrmModule } from '../typeorm/typeorm.module';

@Module({
  imports: [ConfigModule.forRoot(`${process.cwd()}/config`), TypeOrmModule.forRoot(), LoggerModule, RedisModule],
})
export class ReplModule {}
