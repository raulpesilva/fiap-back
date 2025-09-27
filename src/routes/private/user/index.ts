import { FastifyPluginCallback } from 'fastify';
import { db } from 'src/db';

export const userRoutes: FastifyPluginCallback = (server, _options, done) => {
  server.get('/users', async () => {
    const users = db.getTable('users').getAll();
    return users;
  });

  done();
};
