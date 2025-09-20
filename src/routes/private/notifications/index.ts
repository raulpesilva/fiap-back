import { FastifyPluginCallback } from 'fastify';
import { multiTenantDB } from 'src/db';
import { pubSub } from '../events';

const farmIdProperty = { farm_id: { type: 'number' } };
const farmParams = { params: { type: 'object', properties: { ...farmIdProperty } } };
const defaultOptions = {
  schema: farmParams,
};

export const notificationsRoutes: FastifyPluginCallback = (server, options, done) => {
  server.get<{ Params: { farm_id: number } }>('/notifications/:farm_id', defaultOptions, async (request, reply) => {
    const { farm_id } = request.params;
    if (!farm_id) return reply.code(400).send({ error: 'User has no farm associated' });
    const notifications = multiTenantDB
      .getInstance(farm_id)
      .getTable('notifications')
      .find((n) => n.farm_id === farm_id);
    return notifications;
  });

  pubSub.subscribe('notification:new', (content) => {
    const notificationsTable = multiTenantDB.getInstance(content.farm_id).getTable('notifications');
    notificationsTable.insert({
      farm_id: content.farm_id,
      message: content.message,
      title: content.title,
      type: content.type,
    });
    server.io.to(`farm_${content.farm_id}`).emit('notification:new');
  });

  done();
};
