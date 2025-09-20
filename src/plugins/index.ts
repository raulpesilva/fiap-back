import { FastifyPluginCallback } from 'fastify';
import { verifyToken } from 'src/utils';

export const authenticate: FastifyPluginCallback = (server, options, done) => {
  server.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers['authorization'];
    server.log.info(`Auth Header: ${authHeader}`);
    if (!authHeader || !authHeader.startsWith('Bearer ')) return reply.code(401).send({ error: 'Unauthorized' });
    const [_drop, token] = authHeader.split(' ');
    try {
      await verifyToken(token);
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
  server.log.info('Authentication plugin registered');
  done();
};
