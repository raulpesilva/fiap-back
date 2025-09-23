import { FastifyPluginCallback } from 'fastify';
import { db, mockDB, multiTenantDB } from 'src/db';

export const adminRoutes: FastifyPluginCallback = (server, _options, done) => {
  server.post('/clear', async () => {
    db.clear();
    multiTenantDB.clear();
    return { success: true };
  });

  server.post('/seed', async () => {
    await mockDB(); // Seed users
    return { success: true };
  });

  server.post('/reset', async () => {
    db.clear();
    multiTenantDB.clear();
    await mockDB(); // Seed users
    return { success: true };
  });
  done();
};
