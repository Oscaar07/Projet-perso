import type { GameState, PlayerId, OfficialParsedDeck } from "@riftbound/core";

export interface RoomSeat {
  socketId: string;
  playerId: PlayerId;
  name: string;
  officialDeck?: OfficialParsedDeck;
}

export interface Room {
  code: string;
  locked: boolean;
  seats: RoomSeat[];
  state: GameState;
  /** Historique serveur pour rewind (états complets, non broadcastés). */
  history: GameState[];
  createdAt: number;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_HISTORY = 50;

export function generateRoomCode(length = 4): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function pushHistory(room: Room, prev: GameState): void {
  room.history.push({ ...prev, lastError: null });
  if (room.history.length > MAX_HISTORY) {
    room.history.splice(0, room.history.length - MAX_HISTORY);
  }
}

/** Store mémoire (fallback si Redis indisponible). */
export class MemoryRoomStore {
  private rooms = new Map<string, Room>();
  private socketToRoom = new Map<string, string>();

  async create(room: Room): Promise<Room> {
    this.rooms.set(room.code, room);
    return room;
  }

  async get(code: string): Promise<Room | undefined> {
    return this.rooms.get(code.toUpperCase());
  }

  async save(room: Room): Promise<void> {
    this.rooms.set(room.code, room);
  }

  async delete(code: string): Promise<void> {
    const room = this.rooms.get(code);
    if (room) {
      for (const seat of room.seats) {
        this.socketToRoom.delete(seat.socketId);
      }
    }
    this.rooms.delete(code);
  }

  bindSocket(socketId: string, code: string): void {
    this.socketToRoom.set(socketId, code);
  }

  roomForSocket(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  unbindSocket(socketId: string): void {
    this.socketToRoom.delete(socketId);
  }
}
