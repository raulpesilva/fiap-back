import cors from '@fastify/cors';
import { FastifyPluginCallback } from 'fastify';
import { db } from 'src/db';

export const userRoutes: FastifyPluginCallback = (server, _options, done) => {
    server.register(cors, { origin: '*' });
  
  server.get('/users', async () => {
    const users = db.getTable('users').getAll();
    return users;
  });

  done();
};
