import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { unlinkSync } from 'node:fs';
import net from 'node:net';
import repl from 'node:repl';

import { ConfigService } from '../config/config.service';
import { SOCKET_PATH } from './repl.constants';

@Injectable()
export class ReplCustomService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {}

  private server: net.Server;

  public async onModuleInit() {
    const help = () => `
      Custom REPL services:
      * redis
    `;

    this.server = net.createServer((socket) => {
      socket.write('      REPL started!\n');
      socket.write(help());

      const repl_server = repl.start({
        input: socket,
        output: socket,
        terminal: true,
        ignoreUndefined: false,
        preview: false,
        useGlobal: true,
      });

      repl_server.on('close', () => {
        socket.destroy();
      });
    });

    await new Promise<void>((resolve) => {
      try {
        unlinkSync(SOCKET_PATH);
      } catch (_error) {}

      this.server.listen(SOCKET_PATH, () => {
        console.log(`${this.config.get('APP_NAME')} REPL unix socket path ${SOCKET_PATH}`);

        resolve();
      });
    });
  }

  public onModuleDestroy() {
    this.server?.close();
  }
}
