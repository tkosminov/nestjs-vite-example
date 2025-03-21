import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule as NestJSTypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

import { ConfigService } from '../config/config.service';
import { TypeOrmOptionsFactory } from './typeorm-options.factory';
import { TypeOrmOptionsModule } from './typeorm-options.module';

@Module({})
export class TypeOrmModule {
  public static forRoot(): DynamicModule {
    return {
      imports: [
        NestJSTypeOrmModule.forRootAsync({
          imports: [TypeOrmOptionsModule.forRoot()],
          inject: [TypeOrmOptionsFactory, ConfigService],
          useFactory: async (factory: TypeOrmOptionsFactory) => {
            await createDatabase({ ifNotExist: true, options: factory.createTypeOrmOptions() as DataSourceOptions });

            return factory.createTypeOrmOptions();
          },
        }),
      ],
      module: TypeOrmModule,
    };
  }
}
