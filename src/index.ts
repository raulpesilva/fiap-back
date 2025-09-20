import 'dotenv/config';

import Fastify from 'fastify';
import fastifySocketIO from 'fastify-socket.io';
import { publicRoutes } from './routes';
import { privateRoutes } from './routes/private';

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z', // Example option: format time
        ignore: 'pid,hostname', // Example option: ignore pid and hostname
      },
    },
  },
});

server.register(fastifySocketIO);
server.register(publicRoutes);
server.register(privateRoutes);
server.get('/', () => ({ status: 'ok' }));

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
server.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
