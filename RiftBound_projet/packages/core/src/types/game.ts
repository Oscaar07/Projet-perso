/** Coût en ressources (Energy / Power) d'une carte. */
export interface CardCost {
  energy: number;
  power: number;
}

/** Entrée catalogue (ingestion Riot → cards.json). */
export interface CardDefinition {
  id: string;
  name: string;
  type: string;
  cost: CardCost;
  keywords: string[];
  /** Tags moteur (REACTION, HIDDEN, GANKING, …). */
  tags: string[];
  text: string;
  /** Might imprimé (Units). */
  might?: number;
  /** Domains (Domain Identity 103.1.b). */
  domains?: string[];
  /** Champion tag (ex: Jinx) pour Legend / Chosen Champion. */
  championTag?: string;
  /** Signature card (103.2.d). */
  signature?: boolean;
  /** Champion unit eligible Chosen Champion. */
  isChampionUnit?: boolean;
}

/** Instance de carte sur le plateau / en main / pile. */
export interface CardInstance {
  instanceId: string;
  cardId: string;
  ownerId: PlayerId;
  /** Contrôleur courant (185) — défaut = owner. */
  controllerId: PlayerId;
  faceDown: boolean;
  /** 141 — Damage marked on Units. */
  damage: number;
  /** Might courant (board) ; null = utiliser printed. */
  might: number | null;
  /** 401 Exhaust / 402 Ready */
  exhausted: boolean;
  /** 410 Stun */
  stunned: boolean;
  /** 701–705 Buffs (+1 Might chacun) */
  buffs: number;
  /** 179 — Tokens are not cards */
  isToken: boolean;
  /** Attached instance ids (717) */
  attachedTo: string | null;
}

export type PlayerId = "player1" | "player2";

export type GamePhase =
  | "setup"
  | "mulligan"
  | "awaken"
  | "beginning"
  | "channel"
  | "draw"
  | "action"
  | "ending"
  | "expiration"
  | "closed"
  | "combat_showdown"
  | "combat_damage"
  | "combat_resolution"
  | "ended";

/** 310 — Neutral/Showdown × Open/Closed. */
export type TurnLayer = "neutral" | "showdown";
export type OpenClosed = "open" | "closed";

/** 331 — Steps of resolving chain items */
export type ChainStep = "finalize" | "execute" | "pass" | "resolve" | "idle";

export interface FacedownSlot {
  card: CardInstance | null;
}

export interface Battlefield {
  id: string;
  controllerId: PlayerId | null;
  facedown: FacedownSlot;
  units: CardInstance[];
  /** 428 — Contested */
  contested: boolean;
  contestedBy: PlayerId | null;
  /** 322.8 / 439 — staged windows */
  stagedShowdown: boolean;
  stagedCombat: boolean;
  /** Combat designations */
  attackerId: PlayerId | null;
  defenderId: PlayerId | null;
}

export interface RunePool {
  energy: number;
  exhaustedEnergy: number;
  power: number;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  hand: CardInstance[];
  deck: CardInstance[];
  trash: CardInstance[];
  base: CardInstance[];
  championZone: CardInstance | null;
  legendZone: CardInstance | null;
  runeDeck: CardInstance[];
  /** Runes channelled onto board (Exhaustable). */
  runeBoard: CardInstance[];
  runes: RunePool;
  /** Atlas score rail / legacy */
  life: number;
  /** 445 Scoring */
  score: number;
  /** Battlefield ids already scored this turn (447) */
  scoredBattlefieldIdsThisTurn: string[];
}

export interface ChainEntry {
  id: string;
  sourceInstanceId: string;
  sourceCardId: string;
  controllerId: PlayerId;
  isReaction: boolean;
  /** Pending until legality check (328 / 355) */
  pending: boolean;
  description: string;
  /** card type for finalize short-circuit (333.1.c) */
  kind: "spell" | "unit" | "gear" | "ability" | "add";
}

export interface ActionLogEntry {
  id: string;
  at: number;
  playerId: PlayerId | "system";
  kind: string;
  text: string;
}

export interface CombatState {
  battlefieldId: string;
  attackerId: PlayerId;
  defenderId: PlayerId;
  step: "showdown" | "damage" | "resolution";
  /** Initial chain of combat showdown emptied without passing focus (343.1) */
  initialChain: boolean;
}

export interface ShowdownState {
  battlefieldId: string;
  /** Players who passed Focus in sequence without play (345) */
  passStreak: PlayerId[];
  combatLinked: boolean;
}

export interface GameState {
  matchId: string;
  turn: number;
  activePlayerId: PlayerId;
  phase: GamePhase;
  turnLayer: TurnLayer;
  openClosed: OpenClosed;
  closedState: boolean;
  priorityPlayerId: PlayerId | null;
  focusPlayerId: PlayerId | null;
  chainStep: ChainStep;
  cleanupInProgress: boolean;
  showdown: ShowdownState | null;
  combat: CombatState | null;
  /** Mode of play victory score (449) — Duel = 8 */
  victoryScore: number;
  /** Suit le Guide officiel How to Play (Duel). */
  officialGuide: boolean;
  /** Premier joueur (Tour Player initial). */
  firstPlayerId: PlayerId;
  /** Mulligan effectué par joueur. */
  mulliganDone: Record<PlayerId, boolean>;
  /** Extra channel déjà accordé (last player first turn). */
  extraChannelUsed: Record<PlayerId, boolean>;
  /** Cartes Main Deck jouées ce tour (Legion 738). */
  mainDeckCardsPlayedThisTurn: Record<PlayerId, number>;
  arbitrationMode: "manual" | "coach";
  started: boolean;
  rewindDepth: number;
  players: Record<PlayerId, PlayerState>;
  battlefields: Battlefield[];
  chain: ChainEntry[];
  actionLog: ActionLogEntry[];
  winnerId: PlayerId | null;
  lastError: GameError | null;
}

export type GameErrorCode =
  | "FACEDOWN_OCCUPIED"
  | "FACEDOWN_NOT_CONTROLLER"
  | "CHAIN_CLOSED"
  | "INSUFFICIENT_RUNES"
  | "CARD_NOT_IN_HAND"
  | "INVALID_TARGET"
  | "INVALID_ACTION"
  | "NOT_YOUR_TURN"
  | "REACTION_REQUIRED"
  | "UNKNOWN_CARD"
  | "DECK_REQUIRED"
  | "NOTHING_TO_REWIND"
  | "MATCH_NOT_STARTED"
  | "NO_PRIORITY"
  | "NO_FOCUS"
  | "WRONG_PHASE"
  | "ALREADY_EXHAUSTED"
  | "ILLEGAL_MOVE"
  | "SHOWDOWN_REQUIRED"
  | "COMBAT_REQUIRED"
  | "DECK_ILLEGAL"
  | "CLEANUP_LOCKED"
  | "EFFECT_UNVERIFIED";

export interface GameError {
  code: GameErrorCode;
  message: string;
  ruleRef?: string;
}

export type PlayerAction =
  | {
      type: "PLAY_FACEDOWN";
      playerId: PlayerId;
      cardInstanceId: string;
      battlefieldId: string;
    }
  | {
      type: "PLAY_CARD";
      playerId: PlayerId;
      cardInstanceId: string;
      targets?: string[];
      /** 731 — payer Accelerate pour entrer Ready */
      accelerate?: boolean;
      /** Ambush — BF où vous avez déjà des unités */
      ambushBattlefieldId?: string;
      /** Destination for Unit (352) — base or controlled BF */
      destination?:
        | { kind: "base" }
        | { kind: "battlefield"; battlefieldId: string };
    }
  | { type: "PASS_PRIORITY"; playerId: PlayerId }
  | { type: "PASS_FOCUS"; playerId: PlayerId }
  | { type: "RESOLVE_CHAIN_TOP"; playerId: PlayerId }
  | {
      type: "SET_BATTLEFIELD_CONTROLLER";
      playerId: PlayerId;
      battlefieldId: string;
      controllerId: PlayerId | null;
    }
  | {
      type: "MOVE_CARD";
      playerId: PlayerId;
      cardInstanceId: string;
      to:
        | { kind: "hand"; ownerId: PlayerId }
        | { kind: "deck"; ownerId: PlayerId }
        | { kind: "trash"; ownerId: PlayerId }
        | { kind: "base"; ownerId: PlayerId }
        | { kind: "battlefield_units"; battlefieldId: string }
        | { kind: "battlefield_facedown"; battlefieldId: string };
    }
  | {
      type: "STANDARD_MOVE";
      playerId: PlayerId;
      unitInstanceIds: string[];
      destination:
        | { kind: "base" }
        | { kind: "battlefield"; battlefieldId: string };
    }
  | {
      type: "HIDE";
      playerId: PlayerId;
      cardInstanceId: string;
      battlefieldId: string;
    }
  | {
      type: "EXHAUST";
      playerId: PlayerId;
      cardInstanceId: string;
    }
  | {
      type: "READY";
      playerId: PlayerId;
      cardInstanceId: string;
    }
  | {
      type: "CHANNEL";
      playerId: PlayerId;
      count?: number;
    }
  | {
      type: "DRAW";
      playerId: PlayerId;
      count?: number;
    }
  | {
      type: "ADD_TO_POOL";
      playerId: PlayerId;
      energy?: number;
      power?: number;
      /** Recycle rune instance for Power */
      recycleInstanceId?: string;
      /** Exhaust rune instance for Energy */
      exhaustInstanceId?: string;
    }
  | {
      type: "DEAL_DAMAGE";
      playerId: PlayerId;
      targetInstanceId: string;
      amount: number;
    }
  | {
      type: "HEAL";
      playerId: PlayerId;
      targetInstanceId?: string;
      all?: boolean;
    }
  | {
      type: "KILL";
      playerId: PlayerId;
      targetInstanceId: string;
    }
  | {
      type: "PREDICT";
      playerId: PlayerId;
      /** Nombre de cartes (Vision = 1). */
      count?: number;
      /** Indices parmi les X regardées à recycler (0-based). */
      recycleIndices?: number[];
    }
  | {
      type: "STUN";
      playerId: PlayerId;
      targetInstanceId: string;
    }
  | {
      type: "MULLIGAN";
      playerId: PlayerId;
      /** Max 2 cards to recycle to bottom of Main Deck, then redraw. */
      cardInstanceIds: string[];
    }
  | {
      type: "END_TURN";
      playerId: PlayerId;
    }
  | {
      type: "ADVANCE_PHASE";
      playerId: PlayerId;
    }
  | {
      type: "OPEN_SHOWDOWN";
      playerId: PlayerId;
      battlefieldId: string;
    }
  | {
      type: "CLOSE_SHOWDOWN";
      playerId: PlayerId;
    }
  | {
      type: "BEGIN_COMBAT";
      playerId: PlayerId;
      battlefieldId: string;
    }
  | {
      type: "ADVANCE_COMBAT";
      playerId: PlayerId;
    }
  | {
      type: "CONCEDE";
      playerId: PlayerId;
    }
  | {
      type: "ADJUST_RUNES";
      playerId: PlayerId;
      targetPlayerId: PlayerId;
      energyDelta?: number;
      powerDelta?: number;
      exhaustedDelta?: number;
    }
  | {
      type: "ADJUST_LIFE";
      playerId: PlayerId;
      targetPlayerId: PlayerId;
      delta: number;
    }
  | {
      type: "ADJUST_SCORE";
      playerId: PlayerId;
      targetPlayerId: PlayerId;
      delta: number;
      battlefieldId?: string;
    }
  | { type: "REWIND"; playerId: PlayerId }
  | {
      type: "SET_ARBITRATION_MODE";
      playerId: PlayerId;
      mode: "manual" | "coach";
    }
  | {
      type: "RUN_CLEANUP";
      playerId: PlayerId;
    };
