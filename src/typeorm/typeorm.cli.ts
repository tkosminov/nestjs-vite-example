import { DataSource, DataSourceOptions } from 'typeorm';

import { ConfigService } from '../config/config.service';
import { TypeOrmOptionsFactory } from './typeorm-options.factory';

const config = new ConfigService(`${process.cwd()}/config`);
const factory = new TypeOrmOptionsFactory(config);

export default new DataSource({
  ...(factory.createTypeOrmOptions() as DataSourceOptions),
});
