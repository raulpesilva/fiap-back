import { Farm, Goal, Notification, Product, PublicUser, Transaction, User } from 'src/@types/db';
import { hashPassword } from 'src/utils';

const DB_ERROS = {
  DOCUMENT_ALREADY_EXISTS: 'Document already exists',
  DOCUMENT_NOT_FOUND: 'Document not found',
  INVALID_QUERY: 'Invalid query',
  INVALID_DOCUMENT: 'Invalid document',
};

interface DBBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export class DBTable<
  T extends DBBase,
  Name extends string = string,
  R extends (doc: T, index: number) => any = (doc: T) => any
> {
  name: Name;
  data: Set<T>;
  options?: { normalize?: R };
  initialID = 1;

  constructor(name: Name, options?: { normalize?: R }) {
    this.name = name;
    this.data = new Set();
    this.options = options;
  }

  private getNextId() {
    return this.initialID++;
  }

  insert(document: Omit<T, 'id' | 'created_at' | 'updated_at'>) {
    if (!document) throw new Error(DB_ERROS.INVALID_DOCUMENT);
    const newDoc = {
      ...document,
      id: this.getNextId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as T;
    this.data.add(newDoc);
    return newDoc;
  }

  find<ResultType = T>(
    query: (doc: T, index: number) => boolean,
    options: { normalize?: boolean | ((doc: T) => ResultType) } = {}
  ) {
    const documents = Array.from(this.data.values()).sort((a, b) => b.id - a.id);
    const result = documents.filter(query);
    if (options.normalize && this.options?.normalize) {
      const normalize = typeof options.normalize === 'function' ? options.normalize : this.options.normalize;
      const normalizedResult = result.map(normalize);
      return normalizedResult as ReturnType<typeof normalize>[] extends any[] ? never : ReturnType<typeof normalize>[];
    }
    return result;
  }

  update(query: (doc: T, index: number) => boolean, update: Partial<T>) {
    const documents = this.find(query);
    documents.forEach((doc) => Object.assign(doc, { ...update, updated_at: new Date().toISOString() }));
    return documents;
  }

  delete(query: (doc: T, index: number) => boolean) {
    const documents = this.find(query);
    const totalDocuments = this.data.size;
    documents.forEach((doc) => this.data.delete(doc));
    return { deletedCount: totalDocuments - this.data.size };
  }
  getAll() {
    const documents = Array.from(this.data.values()).sort((a, b) => b.id - a.id);
    if (this.options?.normalize)
      return documents.map(this.options.normalize) as ReturnType<R>[] extends any[] ? never : ReturnType<R>[];
    return documents;
  }

  clear() {
    this.data.clear();
    this.initialID = 1;
  }
}

class Database<Tables extends { [key: string]: DBTable<any> } = {}> {
  tables: Tables;

  constructor(tables: Tables) {
    this.tables = tables;
  }

  getTable<Type extends keyof Tables>(name: Type): Tables[Type] {
    const table = this.tables[name];
    if (!table) throw new Error(`Table ${name.toString()} does not exist`);
    return table;
  }

  clear() {
    Object.values(this.tables).forEach((table) => table.clear());
  }
}

export class MultiTenantDB {
  databaseInstances = new Map([[-1, this.createNewInstance()]]);

  constructor() {
    this.databaseInstances.delete(-1);
  }

  private createNewInstance() {
    return new Database({
      goals: new DBTable<Goal>('goals'),
      products: new DBTable<Product>('products'),
      transactions: new DBTable<Transaction>('transactions'),
      notifications: new DBTable<Notification>('notifications'),
    });
  }

  createInstance(id: number) {
    const farm = this.createNewInstance();
    this.databaseInstances.set(id, farm);
  }

  getInstance(id: number) {
    if (!this.databaseInstances.has(id)) this.createInstance(id);
    return this.databaseInstances.get(id);
  }

  deleteInstance(id: number) {
    this.databaseInstances.delete(id);
  }

  clear() {
    this.databaseInstances.clear();
  }
}

export const db = new Database({
  farms: new DBTable<Farm>('farms'),
  users: new DBTable<User>('users', { normalize: ({ password: _drop, ...doc }) => doc as PublicUser }),
});

export const multiTenantDB = new MultiTenantDB();

export const mockDB = async () => {
  const usersTable = db.getTable('users');

  const user = usersTable.insert({ name: 'raul', email: 'raul@fiap.com', password: await hashPassword('123456') });
  const farm = db.getTable('farms').insert({ user_id: user.id, name: 'mock farm' });
  const farmDB = multiTenantDB.getInstance(farm.id);

  const productsTable = farmDB.getTable('products');
  const product1 = productsTable.insert({ farm_id: farm.id, name: 'Fiap 1', icon: 'sprout', color: 'blue' });
  const product2 = productsTable.insert({ farm_id: farm.id, name: 'Fiap 2', icon: 'vegan', color: 'purple' });
  const product3 = productsTable.insert({ farm_id: farm.id, name: 'Fiap 3', icon: 'cherry', color: 'pink' });
  const product4 = productsTable.insert({ farm_id: farm.id, name: 'Fiap 4', icon: 'carrot', color: 'orange' });

  const goalsTable = farmDB.getTable('goals');
  const goal = goalsTable.insert({
    farm_id: farm.id,
    product_id: product1.id,
    name: 'meta 1',
    type: 'storage',
    measure: 'quantity',
    target: 1000,
    value: 0,
  });
};

mockDB();
