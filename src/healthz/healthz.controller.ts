import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { ConfigService } from '../config/config.service';

const TOTAL_MEMORY_HEAP = 1000 * 1024 * 1024; // 1G
const TOTAL_MEMORY_RSS = 1000 * 1024 * 1024; // 1G

@Controller('healthz')
export class HealthzController {
  constructor(
    private readonly config: ConfigService,
    private readonly healthz: HealthCheckService,
    private readonly db_healthz: TypeOrmHealthIndicator,
    private readonly memory_healthz: MemoryHealthIndicator,
    private readonly micro_healthz: MicroserviceHealthIndicator
  ) {}

  @Get()
  public async liveness() {
    return { message: 'ok' };
  }

  @Get('readiness')
  @HealthCheck()
  public async readiness() {
    const service_ping_checks: HealthIndicatorFunction[] = [
      () => this.db_healthz.pingCheck('PostgreSQL'),
      () =>
        this.micro_healthz.pingCheck('Redis', {
          transport: Transport.REDIS,
          options: {
            host: this.config.get('REDIS_HOST'),
            port: this.config.get('REDIS_PORT'),
            password: this.config.get('REDIS_PASSWORD'),
            keyPrefix: this.config.get('REDIS_KEY'),
          },
        }),
      () => this.memory_healthz.checkHeap('MEMORY_HEAP', TOTAL_MEMORY_HEAP),
      () => this.memory_healthz.checkRSS('MEMORY_RSS', TOTAL_MEMORY_RSS),
    ];

    return this.healthz.check(service_ping_checks);
  }
}
