import cors from '@fastify/cors';
import { FastifyPluginCallback } from 'fastify';
import { Transaction, TransactionPayload } from 'src/@types/db';
import { multiTenantDB } from 'src/db';
import { pubSub } from '../events';

const farmParams = { type: 'object', properties: { farm_id: { type: 'number' } } };
const farmQueryString = { type: 'object', properties: { filter: { type: 'string' } } };
const farmBody = { type: 'object' };
const defaultOptions = {
  schema: { params: farmParams, querystring: farmQueryString },
};
const postTransactionOptions = { schema: { params: farmParams } };
export const transactionRoutes: FastifyPluginCallback = (server, _options, done) => {
    server.register(cors, { origin: '*' });
  
  interface GetTransactions {
    Params: { farm_id: number };
    Querystring: { filter?: string };
  }
  server.get<GetTransactions>('/transactions/:farm_id', defaultOptions, async (request, reply) => {
    const { farm_id } = request.params;
    const { filter } = request.query;
    if (!farm_id) return reply.code(400).send({ error: 'User has no farm associated' });
    server.log.info(`Fetching transactions for farm_id: ${farm_id} with filter: ${filter}`);
    const transactions = multiTenantDB
      .getInstance(farm_id)
      .getTable('transactions')
      .find((g) => {
        if (filter !== undefined && g.type !== filter) return false;
        return g.farm_id === farm_id;
      });

    return transactions;
  });

  interface PostTransaction {
    Params: { farm_id: number };
    Body: TransactionPayload;
  }
  server.post<PostTransaction>('/transactions/:farm_id', postTransactionOptions, async (request, reply) => {
    const { farm_id } = request.params;
    if (!farm_id) return reply.code(400).send({ error: 'User has no farm associated' });
    const body = request.body;
    const payload: Partial<Transaction> = {
      farm_id,
      product_id: body.product_id,
      quantity: body.quantity,
      type: body.type,
      date: body.date,
    };
    if (body.type === 'sale' && payload.type === 'sale') payload.price = body.total_price / body.quantity;
    if (body.type === 'sale' && payload.type === 'sale') payload.total_price = body.total_price;

    const transaction = multiTenantDB
      .getInstance(farm_id)
      .getTable('transactions')
      .insert(payload as Transaction);

    server.io.to(`farm_${farm_id}`).emit('transaction:new', transaction);
    pubSub.publish('transaction:event', farm_id);

    return reply.code(201).send(transaction);
  });

  done();
};
