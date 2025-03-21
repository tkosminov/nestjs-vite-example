import { plainToInstance, Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Min, validateSync, ValidationError } from 'class-validator';

function toBoolean(value?: boolean | string) {
  if (typeof value === 'undefined') {
    return undefined;
  } else if (typeof value === 'boolean') {
    return value;
  } else {
    if (value.toLowerCase() === 'false') {
      return false;
    }

    if (value.toLowerCase() === 'true') {
      return false;
    }

    return undefined;
  }
}

function toArray(value?: unknown[] | string) {
  if (typeof value === 'undefined') {
    return undefined;
  } else if (Array.isArray(value)) {
    return value;
  } else {
    try {
      const arr = JSON.parse(value);

      if (Array.isArray(arr)) {
        return arr;
      }
    } catch (error) {
      // continue
    }

    return undefined;
  }
}

function toNumber(value?: number | string) {
  if (typeof value === 'undefined') {
    return undefined;
  } else if (typeof value === 'number') {
    return value;
  } else {
    try {
      const num = parseFloat(value);

      if (!Number.isNaN(num)) {
        return num;
      }
    } catch (error) {
      // continue
    }

    return undefined;
  }
}

export class ConfigEnvSchema {
  @IsIn(['development', 'production'])
  public NODE_ENV: 'development' | 'production';

  @Matches(/^[a-z0-9_]+$/)
  public APP_NAME: string;

  @IsString()
  public APP_BODY_LIMIT: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  public APP_BODY_PARAMETER_LIMIT: number;

  @IsString({ each: true })
  @Transform(({ value }) => toArray(value))
  public CORS_ALLOWED_ORIGINS: string[];

  @IsString({ each: true })
  @Transform(({ value }) => toArray(value))
  public CORS_ALLOWED_METHODS: string[];

  @IsString({ each: true })
  @Transform(({ value }) => toArray(value))
  public CORS_ALLOWED_PATHS: string[];

  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  public CORS_CREDENTIALS: boolean;

  @IsIn(['debug', 'info', 'warn', 'error'])
  public LOGGER_LEVEL: 'debug' | 'info' | 'warn' | 'error';

  @IsString({ each: true })
  @Transform(({ value }) => toArray(value))
  public LOGGER_SILENCE: string[];

  @IsString({ each: true })
  @Transform(({ value }) => toArray(value))
  public LOGGER_KEYWORDS: string[];

  @Matches(/^[a-z0-9_]+$/)
  public DB_DATABASE: string;

  @IsString()
  public DB_HOST: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  public DB_PORT: number;

  @IsString()
  public DB_USERNAME: string;

  @IsString()
  public DB_PASSWORD: string;

  @IsIn(['query', 'schema', 'error', 'warn', 'info', 'log', 'migration'], { each: true })
  @Transform(({ value }) => toArray(value))
  public DB_LOGGING: ('query' | 'schema' | 'error' | 'warn' | 'info' | 'log' | 'migration')[];

  @IsString()
  public REDIS_HOST: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  public REDIS_PORT: number;

  @IsOptional()
  @IsString()
  public REDIS_PASSWORD?: string;

  @Matches(/^[a-z0-9_]+$/)
  public REDIS_KEY: string;

  @IsString()
  public JWT_SECRET_KEY: string;

  @IsIn(['HS256', 'HS512'], { each: true })
  @Transform(({ value }) => toArray(value))
  public JWT_ALGORITHMS: ('HS256' | 'HS512')[];
}

function validate(value: unknown) {
  const data = plainToInstance(ConfigEnvSchema, value);

  const errors: ValidationError[] = validateSync(data, { skipMissingProperties: false });

  if (errors.length > 0) {
    const msg = errors.reduce<string[]>((acc, curr) => {
      if (curr.constraints) {
        acc.push(...Object.values(curr.constraints));
      }

      return acc;
    }, []);

    throw new Error(msg.join(', '));
  }

  return data;
}

function getAllSchemaKeys(): Set<string> {
  const schema = new ConfigEnvSchema();

  return new Set(Object.keys(schema));
}

function getReplacedObj(keys: Set<string>): Record<string, string | undefined> {
  const result_obj_by_keys: Record<string, string | undefined> = {};

  keys.forEach((key) => {
    result_obj_by_keys[key] = process.env[key];
  });

  return result_obj_by_keys;
}

export function loadConfig() {
  const keys = getAllSchemaKeys();
  const obj = getReplacedObj(keys);

  return validate(obj);
}
