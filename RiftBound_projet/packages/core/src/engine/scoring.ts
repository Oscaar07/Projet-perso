import type { GameState, PlayerId } from "../types/game.js";
import { OFFICIAL_GUIDE } from "../rules/officialGuide.js";

function drawOne(state: GameState, playerId: PlayerId): GameState {
  const p = state.players[playerId];
  if (p.deck.length === 0) return state;
  const [top, ...rest] = p.deck;
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...p,
        deck: rest,
        hand: [...p.hand, top!],
      },
    },
  };
}

/** Contrôle effectif : controller + au moins une unité présente. */
export function controlsBattlefield(
  state: GameState,
  playerId: PlayerId,
  battlefieldId: string,
): boolean {
  const bf = state.battlefields.find((b) => b.id === battlefieldId);
  if (!bf) return false;
  return bf.controllerId === playerId && bf.units.length > 0;
}

export function controlsAllBattlefields(
  state: GameState,
  playerId: PlayerId,
): boolean {
  if (state.battlefields.length === 0) return false;
  return state.battlefields.every(
    (bf) => bf.controllerId === playerId && bf.units.length > 0,
  );
}

export type ScoreSource = "hold" | "conquer";

/** Capture d’un BF sans contrôleur précédent vs prise à l’ennemi. */
export type ConquerKind = "empty" | "from_enemy";

/**
 * - Conquer / Hold : +1 (une fois par BF / tour)
 * - Règle des 7 : à ≥7 pts, Conquer d’un terrain vide → draw 1
 * - Coup de grâce (dernier point) : Hold OU contrôle de tous les BF
 */
export function tryScore(
  state: GameState,
  playerId: PlayerId,
  battlefieldId: string,
  source: ScoreSource,
  options?: { conquerKind?: ConquerKind },
): GameState {
  const p = state.players[playerId];
  if (p.scoredBattlefieldIdsThisTurn.includes(battlefieldId)) {
    return state;
  }

  const softCap = OFFICIAL_GUIDE.scoringSoftCap;
  const wouldBe = p.score + 1;
  const isWinningPoint = wouldBe >= state.victoryScore;
  const allBfs = controlsAllBattlefields(state, playerId);

  // Règle des 7 — plus de points « normaux » via terrain vide
  if (
    source === "conquer" &&
    options?.conquerKind === "empty" &&
    p.score >= softCap
  ) {
    if (!(isWinningPoint && allBfs)) {
      return drawOne(state, playerId);
    }
  }

  // Coup de grâce
  if (isWinningPoint) {
    const byHold = source === "hold";
    if (!byHold && !allBfs) {
      return drawOne(state, playerId);
    }
  }

  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...p,
        score: p.score + 1,
        scoredBattlefieldIdsThisTurn: [
          ...p.scoredBattlefieldIdsThisTurn,
          battlefieldId,
        ],
      },
    },
  };

  if (next.players[playerId].score >= next.victoryScore) {
    next = { ...next, winnerId: playerId, phase: "ended" };
  }
  return next;
}

/** Beginning Phase — Hold. */
export function scoreHolding(state: GameState, playerId: PlayerId): GameState {
  let next = state;
  for (const bf of state.battlefields) {
    if (controlsBattlefield(state, playerId, bf.id)) {
      next = tryScore(next, playerId, bf.id, "hold");
      if (next.winnerId) break;
    }
  }
  return next;
}

/**
 * Après Move / Combat : seul contrôleur avec unités → Capture + Conquer.
 */
export function maybeConquer(
  state: GameState,
  battlefieldId: string,
  moverId: PlayerId,
): GameState {
  const bf = state.battlefields.find((b) => b.id === battlefieldId);
  if (!bf) return state;
  const controllers = new Set(bf.units.map((u) => u.controllerId));
  if (controllers.size !== 1 || !controllers.has(moverId)) return state;
  if (bf.units.length === 0) return state;

  if (bf.controllerId === moverId) {
    return {
      ...state,
      battlefields: state.battlefields.map((b) =>
        b.id === battlefieldId
          ? { ...b, contested: false, contestedBy: null }
          : b,
      ),
    };
  }

  const conquerKind: ConquerKind =
    bf.controllerId === null ? "empty" : "from_enemy";

  let next: GameState = {
    ...state,
    battlefields: state.battlefields.map((b) =>
      b.id === battlefieldId
        ? {
            ...b,
            controllerId: moverId,
            contested: false,
            contestedBy: null,
          }
        : b,
    ),
  };
  next = tryScore(next, moverId, battlefieldId, "conquer", { conquerKind });
  return next;
}

export function healAllUnits(state: GameState): GameState {
  const heal = <T extends { damage: number }>(cards: T[]): T[] =>
    cards.map((c) => ({ ...c, damage: 0 }));
  return {
    ...state,
    players: {
      player1: {
        ...state.players.player1,
        base: heal(state.players.player1.base),
      },
      player2: {
        ...state.players.player2,
        base: heal(state.players.player2.base),
      },
    },
    battlefields: state.battlefields.map((bf) => ({
      ...bf,
      units: heal(bf.units),
    })),
  };
}

export function clearStunned(state: GameState): GameState {
  const clr = <T extends { stunned: boolean }>(cards: T[]): T[] =>
    cards.map((c) => ({ ...c, stunned: false }));
  return {
    ...state,
    players: {
      player1: {
        ...state.players.player1,
        base: clr(state.players.player1.base),
      },
      player2: {
        ...state.players.player2,
        base: clr(state.players.player2.base),
      },
    },
    battlefields: state.battlefields.map((bf) => ({
      ...bf,
      units: clr(bf.units),
    })),
  };
}
