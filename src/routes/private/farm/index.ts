import { FastifyPluginCallback } from 'fastify';
import { Farm } from 'src/@types/db';
import { db } from 'src/db';

const ERRORS = {
  FARM_ALREADY_EXISTS: 'Farm already exists for user',
  FARM_NOT_FOUND: 'Farm not found',
};

const idProperty = { id: { type: 'number' } };
const farmParams = { params: { type: 'object', properties: { ...idProperty } } };

export const farmRoutes: FastifyPluginCallback = (server, _options, done) => {
  server.get('/farms', async () => {
    const farms = db.getTable('farms').getAll();
    return farms;
  });

  server.post<{ Body: Farm }>('/farm', async (request, reply) => {
    const farm = {
      user_id: request.user.id,
      name: request.body.name,
    };
    const [existingFarm] = db.getTable('farms').find((f) => f.user_id === request.user.id);
    if (existingFarm) return reply.code(400).send({ error: ERRORS.FARM_ALREADY_EXISTS });
    const newFarm = db.getTable('farms').insert(farm);
    reply.code(201).send(newFarm);
  });

  server.get('/farm', async (request, reply) => {
    const [farm] = db.getTable('farms').find((f) => f.user_id === request.user.id);
    if (!farm) return reply.code(404).send({ error: ERRORS.FARM_NOT_FOUND });
    return farm;
  });

  server.get<{ Params: { id: number } }>('/farm/:id', { schema: farmParams }, async (request, reply) => {
    const { id } = request.params;
    server.log.info(`Fetching farm with id: ${id} for user: ${JSON.stringify(request.user)}`);
    const [farm] = db.getTable('farms').find((f) => f.id === id && f.user_id === request.user.id);
    if (!farm) return reply.code(404).send({ error: ERRORS.FARM_NOT_FOUND });
    return farm;
  });

  done();
};
