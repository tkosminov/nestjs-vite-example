import { DataSource, DataSourceOptions } from 'typeorm';

import { ConfigService } from '../config/config.service';
import { TypeOrmOptionsFactory } from './typeorm-options.factory';

const config = new ConfigService(`${process.cwd()}/config`);
const factory = new TypeOrmOptionsFactory(config);

const dataSource = new DataSource({
  ...(factory.createTypeOrmOptions() as DataSourceOptions),
});

export { dataSource };
