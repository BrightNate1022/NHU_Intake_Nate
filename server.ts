import { config } from 'dotenv';
config({ path: '.env.local' });

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';
import { setupSocketIO } from './src/lib/socket/server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  // Create single HTTP server for both Next.js and Socket.IO
  const httpServer = createServer(handler);
  
  // Attach Socket.IO to the same server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  // Setup Socket.IO handlers
  setupSocketIO(io);

  // Start the combined server
  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO attached at /socket.io`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});
