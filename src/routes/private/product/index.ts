import { FastifyPluginCallback } from 'fastify';
import { Product } from 'src/@types/db';
import { multiTenantDB } from 'src/db';

const ERRORS = {
  FARM_NOT_FOUND: 'Farm not found for user',
  PRODUCT_NOT_FOUND: 'Product not found',
  INVALID_FARM_ID: 'Invalid farm_id',
  INVALID_PRODUCT_ID: 'Invalid product id',
  PRODUCT_ALREADY_EXISTS: 'Product already exists for farm',
};

const idProperty = { id: { type: 'number' } };
const farmIdProperty = { farm_id: { type: 'number' } };
const farmAndProductId = { params: { type: 'object', properties: { ...idProperty, ...farmIdProperty } } };
const farmParams = { params: { type: 'object', properties: { ...farmIdProperty } } };
const defaultOptions = {
  schema: farmAndProductId,
};
export const productRoutes: FastifyPluginCallback = (server, options, done) => {
  server.get<{ Params: { farm_id: number } }>('/products/:farm_id', { schema: farmParams }, async (request, reply) => {
    const farm_id = request.params.farm_id;
    if (!farm_id) return reply.code(400).send({ error: ERRORS.INVALID_FARM_ID });
    return multiTenantDB.getInstance(farm_id).getTable('products').getAll();
  });

  type PostProduct = { Body: Product; Params: { farm_id: number } };
  server.post<PostProduct>('/product/:farm_id', { schema: farmParams }, async (request, reply) => {
    const farm_id = request.params.farm_id;
    if (!farm_id) return reply.code(400).send({ error: ERRORS.INVALID_FARM_ID });

    const product = {
      farm_id: farm_id,
      name: request.body.name,
      icon: request.body.icon,
      color: request.body.color,
    };
    const newProduct = multiTenantDB.getInstance(farm_id).getTable('products').insert(product);

    server.io.to(`farm_${farm_id}`).emit('product:update');

    reply.code(200).send(newProduct);
  });

  type GetProduct = { Params: { id: number; farm_id: number } };
  server.get<GetProduct>('/product/:farm_id/:id', defaultOptions, async (request, reply) => {
    const { id, farm_id } = request.params;
    const [product] = multiTenantDB
      .getInstance(farm_id)
      .getTable('products')
      .find((p) => p.id === id);
    if (!product) return reply.code(404).send({ error: ERRORS.PRODUCT_NOT_FOUND });
    return product;
  });

  type PutProduct = { Params: { id: number; farm_id: number }; Body: Partial<Product> };
  server.put<PutProduct>('/product/:farm_id/:id', defaultOptions, async (request, reply) => {
    const { id, farm_id } = request.params;
    const [product] = multiTenantDB
      .getInstance(farm_id)
      .getTable('products')
      .find((p) => p.id === id);
    if (!product) return reply.code(404).send({ error: ERRORS.PRODUCT_NOT_FOUND });
    const newProductData = {
      farm_id: farm_id,
      name: request.body.name,
      icon: request.body.icon,
      color: request.body.color,
    };
    const [updatedProduct] = multiTenantDB
      .getInstance(farm_id)
      .getTable('products')
      .update((p) => p.id === id, newProductData);

    server.io.to(`farm_${farm_id}`).emit('product:update');

    return updatedProduct;
  });

  type DeleteProduct = { Params: { id: number; farm_id: number } };
  server.delete<DeleteProduct>('/product/:farm_id/:id', defaultOptions, async (request, reply) => {
    const { id, farm_id } = request.params;

    const farmDB = multiTenantDB.getInstance(farm_id);
    const { success } = farmDB.getTable('products').delete((p) => p.id === id);
    farmDB.getTable('transactions').delete((t) => t.product_id === id);
    farmDB.getTable('goals').delete((g) => g.product_id === id);
    if (!success) return reply.code(404).send({ error: ERRORS.PRODUCT_NOT_FOUND });

    server.io.to(`farm_${farm_id}`).emit('product:update');
    server.io.to(`farm_${farm_id}`).emit('goal:updated');
    server.io.to(`farm_${farm_id}`).emit('notification:update');

    return reply.code(204).send();
  });

  done();
};
