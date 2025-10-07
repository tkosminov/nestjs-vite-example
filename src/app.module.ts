import { MiddlewareConsumer, Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { HealthzModule } from './healthz/healthz.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { LoggerModule } from './logger/logger.module';
import { RedisModule } from './redis/redis.module';
import { ReplCustomModule } from './repl-custom/repl.module';
import { TypeOrmModule } from './typeorm/typeorm.module';

@Module({
  imports: [
    ConfigModule.forRoot(`${process.cwd()}/config`),
    TypeOrmModule.forRoot(),
    HealthzModule,
    LoggerModule,
    RedisModule,
    ReplCustomModule,
  ],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
