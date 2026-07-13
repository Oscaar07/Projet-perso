import { Redis } from "ioredis";
import type { Room } from "./rooms.js";

const PREFIX = "riftbound:room:";

/**
 * Persistance volatile Redis (PRD Phase 2).
 * Si REDIS_URL est absent ou injoignable, le serveur reste sur MemoryRoomStore.
 */
export class RedisRoomStore {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    await this.client.ping();
  }

  async create(room: Room): Promise<Room> {
    await this.client.set(PREFIX + room.code, JSON.stringify(room), "EX", 60 * 60 * 6);
    return room;
  }

  async get(code: string): Promise<Room | undefined> {
    const raw = await this.client.get(PREFIX + code.toUpperCase());
    if (!raw) return undefined;
    return JSON.parse(raw) as Room;
  }

  async save(room: Room): Promise<void> {
    await this.client.set(PREFIX + room.code, JSON.stringify(room), "EX", 60 * 60 * 6);
  }

  async delete(code: string): Promise<void> {
    await this.client.del(PREFIX + code.toUpperCase());
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }
}
