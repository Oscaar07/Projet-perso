import type { CardInstance, GameState, PlayerId } from "../types/game.js";
import { RulesViolation } from "./errors.js";
import { clearTemps, runCleanup } from "./cleanup.js";
import type { CardCatalog } from "../types/factory.js";
import { grantPriority } from "../rules/permissions.js";
import { healAllUnits, scoreHolding, clearStunned } from "./scoring.js";
import { OFFICIAL_GUIDE } from "../rules/officialGuide.js";
import { hasKeyword } from "../rules/keywords.js";

/**
 * Les 6 phases d’un tour (ordre strict) :
 * A Awaken → B Beginning (Hold) → C Channel → D Draw → E Action → F End
 */
export function runStartOfTurn(
  state: GameState,
  playerId: PlayerId,
  catalog?: CardCatalog,
): GameState {
  let next: GameState = {
    ...state,
    activePlayerId: playerId,
    turnLayer: "neutral",
    focusPlayerId: null,
    priorityPlayerId: playerId,
    showdown: null,
    combat: null,
  };

  // A — Awaken : Ready unités, équipements, Runes
  next = { ...next, phase: "awaken" };
  next = readyAll(next, playerId);

  // B — Beginning : Hold + effets « début de tour »
  next = { ...next, phase: "beginning" };
  next = scoreHolding(next, playerId);
  if (next.winnerId) return next;

  // C — Channel : 2 runes (+1 joueur 2 au 1er tour)
  next = { ...next, phase: "channel" };
  let channelCount = OFFICIAL_GUIDE.channelPerTurn;
  const isLastPlayer = playerId !== state.firstPlayerId;
  if (
    isLastPlayer &&
    !state.extraChannelUsed[playerId] &&
    state.officialGuide
  ) {
    channelCount += OFFICIAL_GUIDE.lastPlayerExtraChannelFirstTurn;
    next = {
      ...next,
      extraChannelUsed: { ...next.extraChannelUsed, [playerId]: true },
    };
  }
  next = channelRunes(next, playerId, channelCount);

  // D — Draw : 1 carte (sauf P1 tour 1) + vider réserve d’énergie
  next = { ...next, phase: "draw" };
  const skipDraw =
    OFFICIAL_GUIDE.firstPlayerSkipsFirstDraw &&
    playerId === state.firstPlayerId &&
    state.turn === 1;
  if (!skipDraw) {
    next = drawCards(next, playerId, 1);
  }
  next = emptyAllRunePools(next);

  // E — Action
  next = { ...next, phase: "action" };
  next = grantPriority(next, playerId);
  return runCleanup(next, catalog);
}

export function advancePhase(
  state: GameState,
  playerId: PlayerId,
  catalog?: CardCatalog,
): GameState {
  return endTurn(state, playerId, catalog);
}

export function endTurn(
  state: GameState,
  playerId: PlayerId,
  catalog?: CardCatalog,
): GameState {
  if (playerId !== state.activePlayerId) {
    throw new RulesViolation(
      "NOT_YOUR_TURN",
      "Seul le Turn Player peut terminer le tour.",
      "304",
    );
  }
  if (state.chain.length > 0) {
    throw new RulesViolation(
      "CHAIN_CLOSED",
      "Résolvez The Chain avant de finir le tour.",
      "305",
    );
  }
  if (state.turnLayer === "showdown" || state.combat) {
    throw new RulesViolation(
      "SHOWDOWN_REQUIRED",
      "Terminez Showdown / Combat avant la fin du tour.",
      "316",
    );
  }

  // F — End Phase
  let next: GameState = { ...state, phase: "ending" };

  next = removeTemporaryCards(next, catalog);
  next = healAllUnits(next);
  next = clearStunned(next);
  next = enforceHandLimit(next, playerId, OFFICIAL_GUIDE.maxHandSize);

  next = {
    ...next,
    players: {
      player1: {
        ...next.players.player1,
        scoredBattlefieldIdsThisTurn: [],
      },
      player2: {
        ...next.players.player2,
        scoredBattlefieldIdsThisTurn: [],
      },
    },
    mainDeckCardsPlayedThisTurn: { player1: 0, player2: 0 },
  };

  const nextPlayer: PlayerId =
    state.activePlayerId === "player1" ? "player2" : "player1";
  next = {
    ...next,
    turn: state.turn + 1,
    activePlayerId: nextPlayer,
  };
  return runStartOfTurn(next, nextPlayer, catalog);
}

/** Recycle (bottom of Main Deck) jusqu’à maxHandSize. */
export function enforceHandLimit(
  state: GameState,
  playerId: PlayerId,
  maxHand: number,
): GameState {
  const p = state.players[playerId];
  if (p.hand.length <= maxHand) return state;
  const excess = p.hand.length - maxHand;
  const recycled = p.hand.slice(-excess).map((c) => ({
    ...c,
    faceDown: true,
  }));
  const hand = p.hand.slice(0, maxHand);
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...p,
        hand,
        deck: [...p.deck, ...recycled],
      },
    },
  };
}

function removeTemporaryCards(
  state: GameState,
  catalog?: CardCatalog,
): GameState {
  if (!catalog) return state;

  const trashMoves: { ownerId: PlayerId; card: CardInstance }[] = [];

  const filterZone = (cards: CardInstance[]) => {
    const kept: CardInstance[] = [];
    for (const c of cards) {
      const def = catalog.get(c.cardId);
      if (def && hasKeyword(def.keywords, def.tags, "TEMPORARY")) {
        trashMoves.push({ ownerId: c.ownerId, card: clearTemps(c) });
      } else {
        kept.push(c);
      }
    }
    return kept;
  };

  let next: GameState = {
    ...state,
    players: {
      player1: {
        ...state.players.player1,
        base: filterZone(state.players.player1.base),
      },
      player2: {
        ...state.players.player2,
        base: filterZone(state.players.player2.base),
      },
    },
    battlefields: state.battlefields.map((bf) => ({
      ...bf,
      units: filterZone(bf.units),
    })),
  };

  for (const m of trashMoves) {
    next = {
      ...next,
      players: {
        ...next.players,
        [m.ownerId]: {
          ...next.players[m.ownerId],
          trash: [...next.players[m.ownerId].trash, m.card],
        },
      },
    };
  }
  return next;
}

export function readyAll(state: GameState, playerId: PlayerId): GameState {
  const mapCards = (cards: typeof state.players.player1.base) =>
    cards.map((c) =>
      c.controllerId === playerId || c.ownerId === playerId
        ? { ...c, exhausted: false }
        : c,
    );
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        base: mapCards(state.players[playerId].base),
        runeBoard: mapCards(state.players[playerId].runeBoard),
        legendZone: state.players[playerId].legendZone
          ? { ...state.players[playerId].legendZone!, exhausted: false }
          : null,
      },
    },
    battlefields: state.battlefields.map((bf) => ({
      ...bf,
      units: mapCards(bf.units),
    })),
  };
}

export function channelRunes(
  state: GameState,
  playerId: PlayerId,
  count: number,
): GameState {
  const p = state.players[playerId];
  const take = Math.min(count, p.runeDeck.length);
  if (take === 0) return state;
  const moved = p.runeDeck.slice(0, take);
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...p,
        runeDeck: p.runeDeck.slice(take),
        runeBoard: [
          ...p.runeBoard,
          ...moved.map((c) => ({ ...c, exhausted: false })),
        ],
      },
    },
  };
}

export function drawCards(
  state: GameState,
  playerId: PlayerId,
  count: number,
): GameState {
  let next = state;
  for (let i = 0; i < count; i += 1) {
    const p = next.players[playerId];
    if (p.deck.length === 0) continue;
    const [top, ...rest] = p.deck;
    next = {
      ...next,
      players: {
        ...next.players,
        [playerId]: {
          ...p,
          deck: rest,
          hand: [...p.hand, top!],
        },
      },
    };
  }
  return next;
}

export function emptyAllRunePools(state: GameState): GameState {
  const empty = { energy: 0, exhaustedEnergy: 0, power: 0 };
  return {
    ...state,
    players: {
      player1: { ...state.players.player1, runes: { ...empty } },
      player2: { ...state.players.player2, runes: { ...empty } },
    },
  };
}

export function emptyRunePool(state: GameState, playerId: PlayerId): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        runes: { energy: 0, exhaustedEnergy: 0, power: 0 },
      },
    },
  };
}
