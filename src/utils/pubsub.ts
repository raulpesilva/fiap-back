export class PubSub<Events extends Record<string, (...args: any[]) => void>> {
  private listeners: Map<keyof Events, Set<(...args: any[]) => void>>;

  constructor() {
    this.listeners = new Map();
  }

  subscribe<T extends keyof Events>(event: T, listener: Events[T]) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  unsubscribe<T extends keyof Events>(event: T, listener: Events[T]) {
    this.listeners.get(event)?.delete(listener);
  }

  publish<T extends keyof Events>(event: T, ...args: Parameters<Events[T]>) {
    this.listeners.get(event)?.forEach((listener) => listener(...args));
  }
}
