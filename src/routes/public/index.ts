import fp from 'fastify-plugin';
import { SESSION_DURATION } from 'src/constants';
import { db } from 'src/db';
import { comparePassword, createToken, hashPassword } from 'src/utils';

const ERRORS = {
  USER_EXISTS: 'User already exists',
  INVALID_CREDENTIALS: 'Something went wrong, email or password is incorrect',
  MISSING_FIELDS: (fields: string[]) => `Please provide ${fields.join(', ')}`,
};

export const publicRoutes = fp((server, options, done) => {
  server.post<{ Body: { email: string; password: string; name: string } }>('/sign-up', async (request, reply) => {
    const { email, password, name } = request.body;

    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (missingFields.length > 0) return reply.code(400).send({ error: ERRORS.MISSING_FIELDS(missingFields) });

    const existingUser = db.getTable('users').find((u) => u.email === email);
    if (existingUser.length > 0) return reply.code(400).send({ error: ERRORS.USER_EXISTS });

    const hashedPassword = await hashPassword(password);
    const { password: _drop, ...user } = db.getTable('users').insert({ name, email, password: hashedPassword });
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    const bearer = `Bearer ${await createToken({ user, expiresAt })}`;
    return reply.code(200).header('authorization', bearer).send({ token: bearer });
  });

  server.post<{ Body: { email: string; password: string } }>('/sign-in', async (request, reply) => {
    const { email, password } = request.body;

    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (missingFields.length > 0) return reply.code(400).send({ error: ERRORS.MISSING_FIELDS(missingFields) });

    const [existingUser] = db.getTable('users').find((u) => u.email === email);
    if (!existingUser) return reply.code(400).send({ error: ERRORS.INVALID_CREDENTIALS });

    const isPasswordValid = await comparePassword(password, existingUser.password);
    if (!isPasswordValid) return reply.code(400).send({ error: ERRORS.INVALID_CREDENTIALS });

    const { password: _drop, ...user } = existingUser;
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    const bearer = `Bearer ${await createToken({ user, expiresAt })}`;
    return reply.code(200).header('authorization', bearer).send({ token: bearer });
  });

  done();
});
