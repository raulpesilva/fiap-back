import cors from '@fastify/cors';
import { FastifyPluginCallback } from 'fastify';
import { multiTenantDB } from 'src/db';

const farmIdProperty = { farm_id: { type: 'number' } };
const farmParams = { params: { type: 'object', properties: { ...farmIdProperty } } };
const defaultOptions = {
  schema: farmParams,
};

export const goalRoutes: FastifyPluginCallback = (server, _options, done) => {
    server.register(cors, { origin: '*' });
  
  server.get<{ Params: { farm_id: number } }>('/goals/:farm_id', defaultOptions, async (request, reply) => {
    const { farm_id } = request.params;
    if (!farm_id) return reply.code(400).send({ error: 'User has no farm associated' });
    const goals = multiTenantDB
      .getInstance(farm_id)
      .getTable('goals')
      .find((g) => g.farm_id === farm_id);
    return goals;
  });

  type PostGoal = {
    Body: Partial<{ product_id: number; name: string; measure: string; type: string; target: number }>;
    Params: { farm_id: number };
  };

  server.post<PostGoal>('/goals/:farm_id', defaultOptions, async (request, reply) => {
    const { farm_id } = request.params;
    if (!farm_id) return reply.code(400).send({ error: 'User has no farm associated' });
    const body = request.body;
    if (!body.product_id || !body.name || !body.measure || !body.type || !body.target) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }
    const goal = multiTenantDB.getInstance(farm_id).getTable('goals').insert({
      farm_id,
      product_id: body.product_id,
      name: body.name,
      type: body.type,
      measure: body.measure,
      target: body.target,
      value: 0,
    });

    server.io.to(`farm_${farm_id}`).emit('goal:new');
    return reply.code(201).send(goal);
  });

  done();
};
