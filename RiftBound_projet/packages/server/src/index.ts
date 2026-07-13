import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { Server } from "socket.io";
import { MemoryRoomStore } from "./rooms.js";
import { RedisRoomStore } from "./redis.js";
import { registerSocketHandlers, type RoomBackend } from "./socket.js";

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const REDIS_URL = process.env.REDIS_URL;

async function createStore(): Promise<{ store: RoomBackend; label: string }> {
  if (!REDIS_URL) {
    return { store: new MemoryRoomStore(), label: "memory" };
  }
  try {
    const redis = new RedisRoomStore(REDIS_URL);
    await redis.connect();
    console.log(`[server] Redis connecté (${REDIS_URL})`);
    return { store: redis, label: "redis" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[server] Redis indisponible (${message}) — fallback mémoire`);
    return { store: new MemoryRoomStore(), label: "memory" };
  }
}

async function main(): Promise<void> {
  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "riftbound-scrim" });
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN },
  });

  const { store, label } = await createStore();
  registerSocketHandlers(io, store);

  httpServer.listen(PORT, () => {
    console.log(`[server] écoute :${PORT} (store=${label})`);
  });
}

void main();
