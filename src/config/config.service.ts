import { Injectable } from '@nestjs/common';

import { loadAndReplaceEnvs } from './utils/config';
import { ConfigEnvSchema, loadConfig } from './utils/validation';

@Injectable()
export class ConfigService {
  private readonly _values: ConfigEnvSchema;

  constructor(config_path: string) {
    loadAndReplaceEnvs(config_path);

    this._values = loadConfig();
  }

  public get<K extends keyof ConfigEnvSchema>(key: K) {
    return this._values[key];
  }
}
