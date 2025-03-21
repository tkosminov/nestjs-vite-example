import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory as NestJSTypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { ConfigService } from '../config/config.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Injectable()
export class TypeOrmOptionsFactory implements NestJSTypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  public createTypeOrmOptions(schema?: string): TypeOrmModuleOptions {
    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.config.get('DB_HOST'),
      port: this.config.get('DB_PORT'),
      username: this.config.get('DB_USERNAME'),
      password: this.config.get('DB_PASSWORD'),
      database: this.config.get('DB_DATABASE'),
      entities: [__dirname + '/**/*.entity.{t,j}s'],
      migrations: [__dirname + '/migrations/**/[0-9]*-*.{t,j}s'],
      migrationsRun: true,
      synchronize: false,
      logging: this.config.get('DB_LOGGING'),
      schema,
    };

    return options;
  }
}
