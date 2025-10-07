import { Injectable } from '@nestjs/common';
import { RedisKey } from 'ioredis';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { v4 } from 'uuid';

import { ConfigService } from '../config/config.service';
import { addToREPLContext } from '../repl-custom/repl.helpers';
import { RedisClientService } from './redis-client.service';

export interface IRedisSubscribeMessage {
  readonly message: string;
  readonly channel: string;
}

const REDIS_EXPIRE_TIME_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class RedisService {
  public readonly id: string = v4();
  private readonly _redis_key: string;

  constructor(
    private readonly config: ConfigService,
    private readonly client: RedisClientService
  ) {
    this._redis_key = this.config.get('REDIS_KEY');

    addToREPLContext({ redis: this });
  }

  public get pub_client() {
    return this.client.pub_client;
  }

  public get sub_client() {
    return this.client.sub_client;
  }

  public fromEvent<T>(event_name: string): Observable<T> {
    const key = `${this._redis_key}_${event_name}`;

    this.client.subscribe(key);

    return this.client.events$.pipe(
      filter(({ channel }) => channel === key),
      map(({ message }) => JSON.parse(message)),
      filter((message) => message.redis_id !== this.id)
    );
  }

  public async publish(event_name: string, value: Record<string, unknown>): Promise<number> {
    const key = `${this._redis_key}_${event_name}`;
    const string_value = JSON.stringify({ redis_id: this.id, ...value });

    return new Promise<number>((resolve, reject) =>
      this.client.publish(key, string_value, (error, reply) => {
        if (error) {
          return reject(error);
        }

        return resolve(reply!);
      })
    );
  }

  /**
   * Determine if a key exists
   */
  public async exists(key: RedisKey) {
    return !!(await this.client.sub_client.exists(key));
  }

  /**
   * Get the value of a key
   */
  public async get<T>(key: RedisKey) {
    const res = await this.client.sub_client.get(key);

    if (res) {
      return JSON.parse(res) as T;
    }

    return null;
  }

  /**
   * Set the string value of a key
   */
  public async set(key: RedisKey, value: unknown, expire_time_in_seconds: number = REDIS_EXPIRE_TIME_IN_SECONDS) {
    return this.client.pub_client.set(key, JSON.stringify(value), 'EX', expire_time_in_seconds);
  }

  /**
   * Delete a key
   */
  public async del(...keys: RedisKey[]) {
    return this.client.pub_client.del(keys);
  }

  /**
   * Find all keys matching the given pattern
   */
  public async keys(pattern: string) {
    const key_pattern = `${this._redis_key}${pattern}`;

    return (await this.client.sub_client.keys(key_pattern)).map((key) => key.substring(this._redis_key.length));
  }

  /**
   * Determine if a hash field exists
   */
  public async hexists(key: RedisKey, field: string) {
    return !!(await this.client.sub_client.hexists(key, field));
  }

  /**
   * Set the string value of a hash field
   */
  public async hset(key: RedisKey, field: string, value: unknown) {
    return this.client.pub_client.hset(key, field, JSON.stringify(value));
  }

  /**
   * Set the string value of a hash field
   */
  public async hsetall(key: RedisKey, object: object) {
    return this.client.pub_client.hset(key, object);
  }

  /**
   * Get all the fields and values in a hash
   */
  public async hgetall<T>(key: RedisKey) {
    return this.client.sub_client.hgetall(key) as Promise<T>;
  }

  /**
   * Get the value of a hash field
   */
  public async hget<T>(key: RedisKey, field: string) {
    const res = await this.client.sub_client.hget(key, field);

    if (res) {
      return JSON.parse(res) as T;
    }

    return null;
  }

  /**
   * Delete one or more hash fields
   */
  public async hdel(key: RedisKey, ...fields: string[]) {
    return this.client.pub_client.hdel(key, ...fields);
  }

  /**
   * Prepend one or multiple values to a list
   */
  public async lpush(key: RedisKey, value: unknown) {
    return this.client.pub_client.lpush(key, JSON.stringify(value));
  }

  /**
   * Append one or multiple values to a list
   */
  public async rpush(key: RedisKey, value: unknown) {
    return this.client.pub_client.rpush(key, JSON.stringify(value));
  }

  /**
   * Remove and get the first element in a list
   * * redis >= 6.2
   */
  public async lpop<T>(key: RedisKey, count: number) {
    const arr = await this.client.sub_client.lpop(key, count);

    return (arr ?? []).map((i) => JSON.parse(i)) as T[];
  }

  /**
   * Remove and get the last element in a list
   * * redis >= 6.2
   */
  public async rpop<T>(key: RedisKey, count: number) {
    const arr = await this.client.sub_client.rpop(key, count);

    return (arr ?? []).map((i) => JSON.parse(i)) as T[];
  }

  /**
   * Get the length of a list
   */
  public async llen(key: RedisKey) {
    return this.client.sub_client.llen(key);
  }

  /**
   * Return the index of matching elements on a list
   */
  public async lpos(key: RedisKey, value: string | number) {
    return this.client.sub_client.lpos(key, value);
  }

  /**
   * Remove elements from a list
   */
  public async lrem(key: RedisKey, count: number | string, element: string | Buffer | number) {
    return this.client.sub_client.lrem(key, count, element);
  }

  /**
   * Get the values of all the given keys
   */
  public async mget(keys: RedisKey[]) {
    const res = await this.client.sub_client.mget(keys);

    if (res) {
      return res.map((data) => JSON.parse(data!));
    }

    return [];
  }

  /**
   * Set multiple keys to multiple values
   */
  public async mset(data: RedisKey[]) {
    await this.client.pub_client.mset(data);
  }

  /**
   * Set a key's time to live in seconds
   */
  public async expire(key: RedisKey, expire_time_in_seconds: number = REDIS_EXPIRE_TIME_IN_SECONDS) {
    return this.client.sub_client.expire(key, expire_time_in_seconds);
  }
}
