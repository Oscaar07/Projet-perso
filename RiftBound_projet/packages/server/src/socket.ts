import type { Server, Socket } from "socket.io";
import {
  appendActionLog,
  createInitialGameState,
  describeAction,
  gameReducer,
  loadCardCatalog,
  maskGameStateForPlayer,
  parseDecklist,
  startMatchWithDecks,
  type PlayerAction,
  type PlayerId,
  type ReduceContext,
} from "@riftbound/core";
import { generateRoomCode, MemoryRoomStore, pushHistory, type Room } from "./rooms.js";
import type { RedisRoomStore } from "./redis.js";

export type RoomBackend = MemoryRoomStore | RedisRoomStore;

interface CreatePayload {
  playerName?: string;
  decklist?: string;
}

interface JoinPayload {
  code: string;
  playerName?: string;
  decklist?: string;
}

interface ActionPayload {
  action: PlayerAction;
}

function isMemoryStore(store: RoomBackend): store is MemoryRoomStore {
  return store instanceof MemoryRoomStore;
}

export function registerSocketHandlers(
  io: Server,
  store: RoomBackend,
): void {
  const catalog = loadCardCatalog();
  const ctx: ReduceContext = { catalog };

  async function persist(room: Room): Promise<void> {
    await store.save(room);
  }

  function syncRewindDepth(room: Room): void {
    room.state = {
      ...room.state,
      rewindDepth: room.history.length,
    };
  }

  function emitViews(room: Room): void {
    syncRewindDepth(room);
    for (const seat of room.seats) {
      const view = maskGameStateForPlayer(room.state, seat.playerId);
      io.to(seat.socketId).emit("game:state", {
        code: room.code,
        playerId: seat.playerId,
        state: view,
      });
    }
  }

  io.on("connection", (socket: Socket) => {
    socket.on("room:create", async (payload: CreatePayload, ack?: (r: unknown) => void) => {
      try {
        const parsed = parseDecklist(payload.decklist ?? "", catalog);
        if (!parsed.ok) {
          ack?.({ ok: false, error: parsed.error.message });
          return;
        }
        if (!parsed.deck.official) {
          ack?.({
            ok: false,
            error:
              "Deck Guide officiel requis (#legend #champion #battlefield #runes #main). Utilisez le modèle d'exemple.",
          });
          return;
        }

        let code = generateRoomCode();
        for (let i = 0; i < 5; i += 1) {
          const existing = await store.get(code);
          if (!existing) break;
          code = generateRoomCode();
        }

        const state = createInitialGameState({
          matchId: code,
          player1Name: payload.playerName ?? "Host",
          player1Deck: parsed.deck.official.mainDeckIds,
          player1Official: parsed.deck.official,
          start: false,
          officialGuide: true,
        });

        const room: Room = {
          code,
          locked: false,
          seats: [
            {
              socketId: socket.id,
              playerId: "player1",
              name: payload.playerName ?? "Host",
              officialDeck: parsed.deck.official,
            },
          ],
          state,
          history: [],
          createdAt: Date.now(),
        };

        await store.create(room);
        if (isMemoryStore(store)) store.bindSocket(socket.id, code);
        await socket.join(code);

        const response = {
          ok: true as const,
          code,
          playerId: "player1" as PlayerId,
          state: maskGameStateForPlayer(state, "player1"),
          waiting: true as const,
        };
        ack?.(response);
        socket.emit("room:created", response);
      } catch (err) {
        const message = err instanceof Error ? err.message : "create failed";
        ack?.({ ok: false, error: message });
      }
    });

    socket.on("room:join", async (payload: JoinPayload, ack?: (r: unknown) => void) => {
      try {
        const code = (payload.code ?? "").toUpperCase().trim();
        const parsed = parseDecklist(payload.decklist ?? "", catalog);
        if (!parsed.ok) {
          ack?.({ ok: false, error: parsed.error.message });
          return;
        }
        if (!parsed.deck.official) {
          ack?.({
            ok: false,
            error:
              "Deck Guide officiel requis (#legend #champion #battlefield #runes #main).",
          });
          return;
        }

        const room = await store.get(code);
        if (!room) {
          ack?.({ ok: false, error: "Salon introuvable." });
          return;
        }
        if (room.locked || room.seats.length >= 2) {
          ack?.({ ok: false, error: "Salon verrouillé (capacité 2)." });
          return;
        }

        const host = room.seats[0];
        const seat = {
          socketId: socket.id,
          playerId: "player2" as PlayerId,
          name: payload.playerName ?? "Guest",
          officialDeck: parsed.deck.official,
        };
        room.seats.push(seat);
        room.locked = true;
        room.state = startMatchWithDecks(
          room.state,
          parsed.deck.official.mainDeckIds,
          seat.name,
          parsed.deck.official,
          host?.officialDeck,
        );
        room.history = [];

        await persist(room);
        if (isMemoryStore(store)) store.bindSocket(socket.id, code);
        await socket.join(code);

        const response = {
          ok: true as const,
          code,
          playerId: "player2" as PlayerId,
          state: maskGameStateForPlayer(room.state, "player2"),
        };
        ack?.(response);
        emitViews(room);
        io.to(code).emit("room:ready", {
          code,
          seats: room.seats.map((s) => ({
            playerId: s.playerId,
            name: s.name,
          })),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "join failed";
        ack?.({ ok: false, error: message });
      }
    });

    socket.on("game:action", async (payload: ActionPayload, ack?: (r: unknown) => void) => {
      try {
        const code = isMemoryStore(store)
          ? store.roomForSocket(socket.id)
          : [...socket.rooms].find((r) => r !== socket.id);

        if (!code) {
          ack?.({ ok: false, error: "Pas de salon." });
          return;
        }

        const room = await store.get(code);
        if (!room) {
          ack?.({ ok: false, error: "Salon introuvable." });
          return;
        }
        room.history ??= [];

        const seat = room.seats.find((s) => s.socketId === socket.id);
        if (!seat) {
          ack?.({ ok: false, error: "Siège introuvable." });
          return;
        }

        const action = { ...payload.action, playerId: seat.playerId };

        if (action.type === "REWIND") {
          if (room.history.length === 0) {
            const err = {
              code: "NOTHING_TO_REWIND" as const,
              message: "Rien à annuler.",
            };
            socket.emit("game:error", err);
            ack?.({ ok: false, error: err });
            return;
          }
          const previous = room.history.pop()!;
          room.state = appendActionLog(
            { ...previous, rewindDepth: room.history.length },
            seat.playerId,
            "REWIND",
            `${seat.name} rewound last action`,
          );
          await persist(room);
          emitViews(room);
          ack?.({ ok: true });
          return;
        }

        if (!room.state.started && action.type !== "SET_ARBITRATION_MODE") {
          const err = {
            code: "MATCH_NOT_STARTED" as const,
            message: "En attente du deck adversaire.",
          };
          socket.emit("game:error", err);
          ack?.({ ok: false, error: err });
          return;
        }

        const prev = room.state;
        let next = gameReducer(prev, action, ctx);

        if (next.lastError) {
          socket.emit("game:error", next.lastError);
          ack?.({ ok: false, error: next.lastError });
          return;
        }

        pushHistory(room, prev);
        next = appendActionLog(
          next,
          seat.playerId,
          action.type,
          `${seat.name}: ${describeAction(action)}`,
        );
        next = { ...next, rewindDepth: room.history.length };
        room.state = next;
        await persist(room);

        emitViews(room);
        ack?.({ ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "action failed";
        ack?.({ ok: false, error: message });
      }
    });

    socket.on("disconnect", async () => {
      if (!isMemoryStore(store)) return;
      const code = store.roomForSocket(socket.id);
      if (!code) return;
      const room = await store.get(code);
      store.unbindSocket(socket.id);
      if (!room) return;
      room.seats = room.seats.filter((s) => s.socketId !== socket.id);
      if (room.seats.length === 0) {
        await store.delete(code);
      } else {
        room.locked = false;
        await persist(room);
        io.to(code).emit("room:peer_left", { code });
      }
    });
  });
}
