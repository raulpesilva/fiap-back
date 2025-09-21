import { PublicUser, Transaction } from '../db';

export interface ServerToClientEvents {
  'notification:new': () => void;
  'notification:update': () => void;
  'product:update': () => void;
  'transaction:new': (transaction: Transaction) => void;
  'goal:new': () => void;
  'goal:updated': () => void;
}

export interface ClientToServerEvents {
  joinFarmRoom: (farmId: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {}

declare module 'socket.io' {
  interface Socket {
    user: PublicUser | null;
  }
}
