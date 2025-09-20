// types/fastify.d.ts
import { Server as IOServer } from 'socket.io';
import { PublicUser } from '../db';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './socket';

declare module 'fastify' {
   interface FastifyRequest {
    user: PublicUser | null;
   }
  interface FastifyInstance {
    io: IOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  }
}
