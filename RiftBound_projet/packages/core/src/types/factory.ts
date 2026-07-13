import type {
  CardDefinition,
  CardInstance,
  GameState,
  PlayerId,
  PlayerState,
} from "./game.js";
import type { OfficialParsedDeck } from "../deck/parseDecklist.js";
import { OFFICIAL_GUIDE } from "../rules/officialGuide.js";

let instanceCounter = 0;

export function resetInstanceCounter(seed = 0): void {
  instanceCounter = seed;
}

export function createCardInstance(
  cardId: string,
  ownerId: PlayerId,
  faceDown = false,
  extras?: Partial<CardInstance>,
): CardInstance {
  instanceCounter += 1;
  return {
    instanceId: `inst_${instanceCounter}`,
    cardId,
    ownerId,
    controllerId: ownerId,
    faceDown,
    damage: 0,
    might: null,
    exhausted: false,
    stunned: false,
    buffs: 0,
    isToken: false,
    attachedTo: null,
    ...extras,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function createPlayer(
  id: PlayerId,
  name: string,
  deckCardIds: string[],
  opts?: {
    legendId?: string;
    championId?: string;
    runeDeckIds?: string[];
  },
): PlayerState {
  const legendZone = opts?.legendId
    ? createCardInstance(opts.legendId, id)
    : null;
  let championZone: CardInstance | null = null;
  let mainIds = [...deckCardIds];
  if (opts?.championId) {
    const idx = mainIds.indexOf(opts.championId);
    if (idx >= 0) mainIds.splice(idx, 1);
    championZone = createCardInstance(opts.championId, id);
  }
  const runeDeck = (opts?.runeDeckIds ?? []).map((cid) =>
    createCardInstance(cid, id),
  );
  const deck = mainIds.map((cardId) => createCardInstance(cardId, id));
  return {
    id,
    name,
    hand: [],
    deck,
    trash: [],
    base: [],
    championZone,
    legendZone,
    runeDeck,
    runeBoard: [],
    runes: { energy: 0, exhaustedEnergy: 0, power: 0 },
    life: 20,
    score: 0,
    scoredBattlefieldIdsThisTurn: [],
  };
}

export function createPlayerFromOfficial(
  id: PlayerId,
  name: string,
  deck: OfficialParsedDeck,
): PlayerState {
  return createPlayer(id, name, shuffle(deck.mainDeckIds), {
    legendId: deck.legendId,
    championId: deck.championId,
    runeDeckIds: shuffle(deck.runeDeckIds),
  });
}

export interface CreateMatchOptions {
  matchId: string;
  player1Name?: string;
  player2Name?: string;
  player1Deck: string[];
  player2Deck?: string[];
  player1Official?: OfficialParsedDeck;
  player2Official?: OfficialParsedDeck;
  player1Legend?: string;
  player2Legend?: string;
  player1Champion?: string;
  player2Champion?: string;
  player1RuneDeck?: string[];
  player2RuneDeck?: string[];
  battlefieldIds?: string[];
  victoryScore?: number;
  /** false = tests sandbox (petits decks, runes numériques). */
  officialGuide?: boolean;
  start?: boolean;
}

function emptyBattlefield(id: string) {
  return {
    id,
    controllerId: null as PlayerId | null,
    facedown: { card: null },
    units: [] as CardInstance[],
    contested: false,
    contestedBy: null as PlayerId | null,
    stagedShowdown: false,
    stagedCombat: false,
    attackerId: null as PlayerId | null,
    defenderId: null as PlayerId | null,
  };
}

export function createInitialGameState(options: CreateMatchOptions): GameState {
  if (!options.player1Deck.length && !options.player1Official) {
    throw new Error("player1Deck is required");
  }

  const official = options.officialGuide !== false;
  const start = options.start === true && Boolean(
    options.player2Deck?.length || options.player2Official,
  );

  const players: GameState["players"] = {
    player1: options.player1Official
      ? createPlayerFromOfficial(
          "player1",
          options.player1Name ?? "Player 1",
          options.player1Official,
        )
      : createPlayer(
          "player1",
          options.player1Name ?? "Player 1",
          options.player1Deck,
          {
            ...(options.player1Legend ? { legendId: options.player1Legend } : {}),
            ...(options.player1Champion
              ? { championId: options.player1Champion }
              : {}),
            ...(options.player1RuneDeck
              ? { runeDeckIds: options.player1RuneDeck }
              : {}),
          },
        ),
    player2: options.player2Official
      ? createPlayerFromOfficial(
          "player2",
          options.player2Name ?? "Player 2",
          options.player2Official,
        )
      : createPlayer(
          "player2",
          options.player2Name ?? "Player 2",
          options.player2Deck ?? [],
          {
            ...(options.player2Legend ? { legendId: options.player2Legend } : {}),
            ...(options.player2Champion
              ? { championId: options.player2Champion }
              : {}),
            ...(options.player2RuneDeck
              ? { runeDeckIds: options.player2RuneDeck }
              : {}),
          },
        ),
  };

  const battlefieldIds =
    options.battlefieldIds ??
    (official && options.player1Official && options.player2Official
      ? ["bf_1", "bf_2"]
      : ["bf_1", "bf_2", "bf_3"]);

  if (start) {
    for (const pid of ["player1", "player2"] as const) {
      const player = players[pid];
      player.hand = player.deck.splice(
        0,
        Math.min(OFFICIAL_GUIDE.openingHand, player.deck.length),
      );
    }
    if (!official) {
      // Sandbox tests only
      players.player1.runes = { energy: 3, exhaustedEnergy: 0, power: 2 };
      players.player2.runes = { energy: 3, exhaustedEnergy: 0, power: 2 };
    }
  }

  const firstPlayerId: PlayerId = "player1";

  return {
    matchId: options.matchId,
    turn: 1,
    activePlayerId: firstPlayerId,
    phase: start ? (official ? "mulligan" : "action") : "setup",
    turnLayer: "neutral",
    openClosed: "open",
    closedState: false,
    priorityPlayerId: start && !official ? firstPlayerId : null,
    focusPlayerId: null,
    chainStep: "idle",
    cleanupInProgress: false,
    showdown: null,
    combat: null,
    victoryScore: options.victoryScore ?? OFFICIAL_GUIDE.victoryScore,
    officialGuide: official,
    firstPlayerId,
    mulliganDone: { player1: !official || !start, player2: !official || !start },
    extraChannelUsed: { player1: false, player2: false },
    mainDeckCardsPlayedThisTurn: { player1: 0, player2: 0 },
    arbitrationMode: "coach",
    started: start,
    rewindDepth: 0,
    players,
    battlefields: battlefieldIds.map(emptyBattlefield),
    chain: [],
    actionLog: [
      {
        id: "log_0",
        at: Date.now(),
        playerId: "system",
        kind: "ROOM",
        text: start
          ? official
            ? "Match started — mulligan (max 2)"
            : "Match started"
          : "Room created — waiting for opponent deck",
      },
    ],
    winnerId: null,
    lastError: null,
  };
}

export function startMatchWithDecks(
  state: GameState,
  player2Deck: string[],
  player2Name?: string,
  player2Official?: OfficialParsedDeck,
  player1Official?: OfficialParsedDeck,
): GameState {
  if (state.started) return state;
  if (!player2Deck.length && !player2Official) {
    throw new Error("player2Deck is required to start");
  }

  const p1Ids = player1Official?.mainDeckIds ??
    state.players.player1.deck.map((c) => c.cardId);
  resetInstanceCounter(0);

  const rebuilt = createInitialGameState({
    matchId: state.matchId,
    player1Name: state.players.player1.name,
    player2Name: player2Name ?? state.players.player2.name,
    player1Deck: p1Ids,
    player2Deck: player2Official?.mainDeckIds ?? player2Deck,
    ...(player1Official ? { player1Official } : {}),
    ...(player2Official ? { player2Official } : {}),
    start: true,
    victoryScore: state.victoryScore,
    officialGuide: Boolean(player1Official && player2Official) || state.officialGuide,
    ...(player1Official && player2Official
      ? { battlefieldIds: ["bf_1", "bf_2"] }
      : {}),
  });

  return {
    ...rebuilt,
    actionLog: [
      ...state.actionLog,
      {
        id: `log_start_${Date.now()}`,
        at: Date.now(),
        playerId: "system",
        kind: "START",
        text: rebuilt.officialGuide
          ? "Guide officiel : mulligan puis Awaken→Beginning→Channel→Draw→Action"
          : "Both decks imported — match started",
      },
    ],
  };
}

export type CardCatalog = ReadonlyMap<string, CardDefinition>;

export function catalogFromArray(cards: CardDefinition[]): CardCatalog {
  return new Map(cards.map((c) => [c.id, c]));
}

export function effectiveMight(
  card: CardInstance,
  def?: CardDefinition,
): number {
  const base = card.might ?? def?.might ?? 0;
  return base + card.buffs;
}

export function isMighty(card: CardInstance, def?: CardDefinition): boolean {
  return effectiveMight(card, def) >= 5;
}
