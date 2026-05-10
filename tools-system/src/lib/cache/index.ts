/**
 * Cache abstraction. In-memory now (single Vercel function instance).
 * Swap to Redis/Upstash later by writing a new adapter and exporting it from here.
 */

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

type Entry = { value: unknown; expiresAt: number };

class MemoryCache implements CacheAdapter {
  private store = new Map<string, Entry>();

  async get<T>(key: string): Promise<T | null> {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return e.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __toolsCache: CacheAdapter | undefined;
}

export const cache: CacheAdapter = globalThis.__toolsCache ?? new MemoryCache();
if (!globalThis.__toolsCache) globalThis.__toolsCache = cache;
