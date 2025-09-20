export type Product = {
  id: number;
  farm_id: number;
  name: string;
  icon: string;
  color: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export type PublicUser = Omit<User, 'password'>;

export type Farm = {
  id: number;
  user_id: number;
  name: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export interface Goal {
  id: number;
  product_id: number;
  farm_id: number;

  name: string;
  measure: string; //'quantity' | 'price';
  type: string;

  value: number;
  target: number;
  completed?: string; // ISO date string when completed
  notified?: string; // ISO date string when notified
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface TransactionBase {
  id: number;
  farm_id: number;
  product_id: number;
  date: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface Storage extends TransactionBase {
  type: 'storage';
  quantity: number;
}
export interface Sale extends TransactionBase {
  type: 'sale';
  quantity: number;
  price: number;
  total_price: number;
}
export interface Plant extends TransactionBase {
  type: 'plant';
  quantity: number;
}
export interface Harvest extends TransactionBase {
  type: 'harvest';
  quantity: number;
}
export type Transaction = Storage | Sale | Plant | Harvest;
type RemoveCommon<T> = Omit<T, 'id' | 'created_at' | 'updated_at' | 'farm_id'>;
export type TransactionPayload =
  | RemoveCommon<Storage>
  | RemoveCommon<Sale>
  | RemoveCommon<Plant>
  | RemoveCommon<Harvest>;

export interface Notification {
  id: number;
  farm_id: number;
  read?: string; // ISO date string when read
  type: string;
  title: string;
  message: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
