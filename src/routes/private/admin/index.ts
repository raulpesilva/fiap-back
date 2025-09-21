import { FastifyPluginCallback } from 'fastify';
import { db, mockDB, multiTenantDB } from 'src/db';

export const adminRoutes: FastifyPluginCallback = (server, options, done) => {
  server.post('/clear', async (request, reply) => {
    db.clear();
    multiTenantDB.clear();
    return { success: true };
  });

  server.post('/seed', async (request, reply) => {
    await mockDB(); // Seed users
    return { success: true };
  });

  server.post('/reset', async (request, reply) => {
    db.clear();
    multiTenantDB.clear();
    await mockDB(); // Seed users
    return { success: true };
  });
  done();
};
