import { FastifyPluginCallback } from 'fastify';
import { db } from 'src/db';

export const userRoutes: FastifyPluginCallback = (server, options, done) => {
  server.get('/users', async (request, reply) => {
    const users = db.getTable('users').getAll();
    return users;
  });

  done();
};
