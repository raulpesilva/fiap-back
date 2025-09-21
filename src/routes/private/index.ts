import { FastifyPluginCallback } from 'fastify';
import { verifyToken } from 'src/utils';
import { adminRoutes } from './admin';
import { eventsPlugin } from './events';
import { farmRoutes } from './farm';
import { goalRoutes } from './goal';
import { notificationsRoutes } from './notifications';
import { productRoutes } from './product';
import { transactionRoutes } from './transactions';
import { userRoutes } from './user';
import { webSocketsRoutes } from './websockets';

export const privateRoutes: FastifyPluginCallback = (server, options, done) => {
  server.decorateRequest('user', null);
  server.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers['authorization'];
    server.log.info(`Auth Header: ${authHeader}`);
    if (!authHeader || !authHeader.startsWith('Bearer ')) return reply.code(401).send({ error: 'Unauthorized' });
    const [_drop, token] = authHeader.split(' ');
    try {
      const user = await verifyToken(token);
      server.log.info(`Authenticated user: ${JSON.stringify(user)}`);
      request.user = user;
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
  server.register(productRoutes);
  server.register(farmRoutes);
  server.register(goalRoutes);
  server.register(transactionRoutes);
  server.register(webSocketsRoutes);
  server.register(notificationsRoutes);
  server.register(eventsPlugin);
  server.register(adminRoutes);
  if (process.env.NODE_ENV === 'development') server.register(userRoutes);
  server.log.info(`node env: ${process.env.NODE_ENV}`);
  done();
};
