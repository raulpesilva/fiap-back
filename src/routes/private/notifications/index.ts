import cors from '@fastify/cors';
import { FastifyPluginCallback } from 'fastify';
import { multiTenantDB } from 'src/db';
import { pubSub } from '../events';

const farmIdProperty = { farm_id: { type: 'number' } };
const notificationIdProperty = { id: { type: 'number' } };
const farmParams = { params: { type: 'object', properties: { ...farmIdProperty } } };
const defaultOptions = {
  schema: farmParams,
};

export const notificationsRoutes: FastifyPluginCallback = (server, _options, done) => {
    server.register(cors, { origin: '*' });
  
  server.get<{ Params: { farm_id: number } }>('/notifications/:farm_id', defaultOptions, async (request, reply) => {
    const { farm_id } = request.params;
    if (!farm_id) return reply.code(400).send({ error: 'User has no farm associated' });
    const notifications = multiTenantDB
      .getInstance(farm_id)
      .getTable('notifications')
      .find((n) => n.farm_id === farm_id);
    return notifications;
  });

  server.post<{ Params: { farm_id: number; id: number } }>(
    '/notifications/read/:farm_id/:id',
    { schema: { params: { type: 'object', properties: { ...farmIdProperty, ...notificationIdProperty } } } },
    async (request, reply) => {
      const { farm_id, id } = request.params;
      if (!farm_id) return reply.code(400).send({ error: 'User has no farm associated' });
      const notificationsTable = multiTenantDB.getInstance(farm_id).getTable('notifications');
      const [notification] = notificationsTable.find((n) => n.id === id);
      if (!notification) return reply.code(404).send({ error: 'Notification not found' });
      notification.read = new Date().toISOString();
      notificationsTable.update((n) => n.id === id, notification);
      server.io.to(`farm_${farm_id}`).emit('notification:update');
      return notification;
    }
  );

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
