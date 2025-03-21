import { Injectable } from '@nestjs/common';
import IORedis, { Callback, Redis } from 'ioredis';
import { Subject } from 'rxjs';

import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisClientService {
  private _pub_client: Redis;
  private _sub_client: Redis;

  private readonly subscribed_events = new Set<string>();
  public readonly events$ = new Subject<{ channel: string; message: string }>();

  constructor(private readonly config: ConfigService) {
    if (!this._pub_client) {
      this.createPubClient();
    }

    if (!this._sub_client) {
      this.createSubClient();
    }
  }

  public get pub_client() {
    if (!this._pub_client) {
      this.createPubClient();
    }

    return this._pub_client;
  }

  public get sub_client() {
    if (!this._sub_client) {
      this.createSubClient();
    }

    return this._sub_client;
  }

  public subscribe(event_name: string) {
    this.subscribed_events.add(event_name);

    this.sub_client.subscribe(event_name);
  }

  public unsubscribe(event_name: string) {
    if (this._sub_client) {
      this._sub_client.unsubscribe(event_name);
    }

    this.subscribed_events.delete(event_name);
  }

  public publish(event_name: string, value: string, cb: Callback<number>) {
    this.pub_client.publish(event_name, value, cb);
  }

  private createPubClient() {
    this._pub_client = new IORedis({
      host: this.config.get('REDIS_HOST'),
      port: this.config.get('REDIS_PORT'),
      password: this.config.get('REDIS_PASSWORD'),
      keyPrefix: this.config.get('REDIS_KEY'),
    });
  }

  private createSubClient() {
    this._sub_client = new IORedis({
      host: this.config.get('REDIS_HOST'),
      port: this.config.get('REDIS_PORT'),
      password: this.config.get('REDIS_PASSWORD'),
      keyPrefix: this.config.get('REDIS_KEY'),
    });

    this.subscribed_events.forEach((event_name) => {
      this._sub_client.subscribe(event_name);
    });

    this._sub_client.on('message', (channel, message) => {
      if (this.subscribed_events.has(channel)) {
        this.events$.next({ channel, message });
      }
    });
  }
}
