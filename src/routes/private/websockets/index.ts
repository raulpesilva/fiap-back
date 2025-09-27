import { FastifyPluginCallback } from 'fastify';
import { verifyToken } from 'src/utils';

export const webSocketsRoutes: FastifyPluginCallback = (server, _options, done) => {
  server.ready().then(() => {
    server.log.info('Websocket routes plugin loaded.');
    server.io.use(async (socket, next) => {
      const authHeader = socket.handshake.headers['authorization'];
      server.log.info(`WebSocket Auth Header: ${authHeader}`);
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        server.log.warn('Unauthorized WebSocket connection attempt.');
        return next(new Error('Unauthorized'));
      }
      const [_drop, token] = authHeader.split(' ');
      try {
        const user = await verifyToken(token);
        socket.user = user;
        return next();
      } catch (err) {
        server.log.warn('Unauthorized WebSocket connection attempt.');
        return next(new Error('Unauthorized'));
      }
    });

    server.io.on('connection', (socket) => {
      server.log.info(`Socket conectado: ${socket.id} ${JSON.stringify(socket.user)}`);

      socket.on('joinFarmRoom', (farmId) => {
        server.log.info(`Socket ${socket.id} joining farm room: ${farmId}`);
        socket.join(`farm_${farmId}`);
      });

      socket.on('disconnect', () => {
        server.log.info(`Socket desconectado: ${socket.id}`);
      });
    });
  });

  done();
};
