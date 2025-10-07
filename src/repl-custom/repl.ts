import net from 'node:net';

import { SOCKET_PATH } from './repl.constants';

function startClient() {
  const socket = net.connect(SOCKET_PATH);

  process.stdin.pipe(socket);
  socket.pipe(process.stdout);

  socket.on('connect', () => {
    process.stdin?.setRawMode(true);
  });

  socket.on('close', () => process.exit(0));
  socket.on('exit', () => socket.end());
}

startClient();
