import type {
  CardDefinition,
  CardInstance,
  GameState,
  PlayerId,
} from "../types/game.js";
import type { CardCatalog } from "../types/factory.js";
import { effectiveMight } from "../types/factory.js";
import { hasKeyword } from "../rules/keywords.js";
import { grantFocus } from "../rules/permissions.js";

/**
 * Cleanup 318–322 — boucle jusqu'à stabilité (321).
 * 320 : cleanupInProgress empêche Resolve / pass.
 */
export function runCleanup(state: GameState, catalog?: CardCatalog): GameState {
  let current: GameState = { ...state, cleanupInProgress: true };
  for (let guard = 0; guard < 12; guard += 1) {
    const next = cleanupOnce(current, catalog);
    if (fingerprint(next) === fingerprint(current)) {
      return { ...next, cleanupInProgress: false };
    }
    current = next;
  }
  return { ...current, cleanupInProgress: false };
}

function fingerprint(state: GameState): string {
  return JSON.stringify({
    w: state.winnerId,
    bfs: state.battlefields.map((bf) => ({
      id: bf.id,
      c: bf.controllerId,
      contested: bf.contested,
      contestedBy: bf.contestedBy,
      ss: bf.stagedShowdown,
      sc: bf.stagedCombat,
      f: bf.facedown.card?.instanceId ?? null,
      u: bf.units.map((u) => `${u.instanceId}:${u.damage}:${u.controllerId}`),
    })),
    scores: {
      p1: state.players.player1.score,
      p2: state.players.player2.score,
    },
    trash: [
      state.players.player1.trash.length,
      state.players.player2.trash.length,
    ],
    base: [
      state.players.player1.base.length,
      state.players.player2.base.length,
    ],
    chain: state.chain.length,
    layer: state.turnLayer,
  });
}

function cleanupOnce(state: GameState, catalog?: CardCatalog): GameState {
  let next = state;

  // 322.1 — Victory Score
  for (const pid of ["player1", "player2"] as const) {
    if (next.players[pid].score >= next.victoryScore) {
      return { ...next, winnerId: pid, phase: "ended" };
    }
  }

  // 322.3–322.4 — Deathknell note + Kill lethal
  const deathknellPending: GameState["chain"] = [];
  const killMoves: { ownerId: PlayerId; card: CardInstance }[] = [];

  const stripLethal = (
    units: CardInstance[],
  ): CardInstance[] => {
    const kept: CardInstance[] = [];
    for (const u of units) {
      const def = catalog?.get(u.cardId);
      const might = effectiveMight(u, def);
      if (u.damage > 0 && u.damage >= might && might > 0) {
        if (def && hasKeyword(def.keywords, def.tags, "DEATHKNELL")) {
          deathknellPending.push({
            id: `dk_${u.instanceId}`,
            sourceInstanceId: u.instanceId,
            sourceCardId: u.cardId,
            controllerId: u.controllerId,
            isReaction: false,
            pending: true,
            description: `Deathknell: ${def.name}`,
            kind: "ability",
          });
        }
        killMoves.push({
          ownerId: u.ownerId,
          card: clearTemps({ ...u, faceDown: false }),
        });
      } else {
        kept.push(u);
      }
    }
    return kept;
  };

  next = {
    ...next,
    battlefields: next.battlefields.map((bf) => ({
      ...bf,
      units: stripLethal(bf.units),
    })),
    players: {
      player1: {
        ...next.players.player1,
        base: stripLethal(next.players.player1.base),
      },
      player2: {
        ...next.players.player2,
        base: stripLethal(next.players.player2.base),
      },
    },
  };

  if (killMoves.length) {
    next = applyTrash(next, killMoves);
  }
  if (deathknellPending.length) {
    next = {
      ...next,
      chain: [...next.chain, ...deathknellPending],
      closedState: true,
      openClosed: "closed",
      chainStep: "finalize",
    };
  }

  // 322.7 — Recall Gear at BFs (Gear type → Base) + Hidden removal
  const recalls: { ownerId: PlayerId; card: CardInstance }[] = [];
  const trashHidden: { ownerId: PlayerId; card: CardInstance }[] = [];

  next = {
    ...next,
    battlefields: next.battlefields.map((bf) => {
      const remainingUnits: CardInstance[] = [];
      for (const u of bf.units) {
        const def = catalog?.get(u.cardId);
        if (def?.type === "Gear") {
          recalls.push({
            ownerId: u.ownerId,
            card: { ...u, exhausted: false },
          });
        } else {
          remainingUnits.push(u);
        }
      }
      let facedown = bf.facedown;
      const hidden = bf.facedown.card;
      if (hidden) {
        if (bf.controllerId === null || hidden.ownerId !== bf.controllerId) {
          trashHidden.push({
            ownerId: hidden.ownerId,
            card: clearTemps({ ...hidden, faceDown: false }),
          });
          facedown = { card: null };
        }
      }
      return { ...bf, units: remainingUnits, facedown };
    }),
  };

  for (const r of recalls) {
    next = {
      ...next,
      players: {
        ...next.players,
        [r.ownerId]: {
          ...next.players[r.ownerId],
          base: [...next.players[r.ownerId].base, r.card],
        },
      },
    };
  }
  if (trashHidden.length) next = applyTrash(next, trashHidden);

  // 322.6 (empty → Uncontrolled) : volontairement non auto-appliqué —
  // le contrôle Atlas / Establish Control se gère via actions explicites.
  // Sinon SET_BATTLEFIELD_CONTROLLER sans unités serait annulé immédiatement.

  // 322.8–322.11 — Stage Showdown / Combat
  next = {
    ...next,
    battlefields: next.battlefields.map((bf) => {
      const controllers = new Set(bf.units.map((u) => u.controllerId));
      const opposing =
        controllers.has("player1") && controllers.has("player2");
      let stagedShowdown = bf.stagedShowdown;
      let stagedCombat = bf.stagedCombat;

      if (bf.contested && bf.controllerId === null && bf.units.length === 0) {
        stagedShowdown = true;
      }
      if (bf.contested && opposing) {
        stagedCombat = true;
        stagedShowdown = false;
      }
      if (stagedShowdown && opposing) {
        stagedShowdown = false;
      }
      if (stagedCombat && !opposing) {
        stagedCombat = false;
      }
      return { ...bf, stagedShowdown, stagedCombat };
    }),
  };

  // 322.13–322.14 — Open Showdown / Combat if Neutral Open
  if (
    next.openClosed === "open" &&
    next.turnLayer === "neutral" &&
    next.chain.length === 0 &&
    !next.showdown &&
    !next.combat
  ) {
    const sd = next.battlefields.find((b) => b.stagedShowdown);
    if (sd) {
      next = openShowdown(next, sd.id);
    } else {
      const cm = next.battlefields.find((b) => b.stagedCombat);
      if (cm) {
        next = openCombat(next, cm.id);
      }
    }
  }

  return next;
}

function openShowdown(state: GameState, battlefieldId: string): GameState {
  const bf = state.battlefields.find((b) => b.id === battlefieldId);
  if (!bf) return state;
  const focus = bf.contestedBy ?? state.activePlayerId;
  let next = grantFocus(
    {
      ...state,
      turnLayer: "showdown",
      showdown: {
        battlefieldId,
        passStreak: [],
        combatLinked: false,
      },
      battlefields: state.battlefields.map((b) =>
        b.id === battlefieldId ? { ...b, stagedShowdown: false } : b,
      ),
    },
    focus,
  );
  return next;
}

function openCombat(state: GameState, battlefieldId: string): GameState {
  const bf = state.battlefields.find((b) => b.id === battlefieldId);
  if (!bf) return state;
  const attacker = bf.contestedBy ?? bf.attackerId ?? state.activePlayerId;
  const defender: PlayerId =
    attacker === "player1" ? "player2" : "player1";
  let next: GameState = {
    ...state,
    turnLayer: "showdown",
    phase: "combat_showdown",
    combat: {
      battlefieldId,
      attackerId: attacker,
      defenderId: defender,
      step: "showdown",
      initialChain: true,
    },
    showdown: {
      battlefieldId,
      passStreak: [],
      combatLinked: true,
    },
    battlefields: state.battlefields.map((b) =>
      b.id === battlefieldId
        ? {
            ...b,
            stagedCombat: false,
            attackerId: attacker,
            defenderId: defender,
          }
        : b,
    ),
  };
  next = grantFocus(next, attacker);
  return next;
}

function applyTrash(
  state: GameState,
  moves: { ownerId: PlayerId; card: CardInstance }[],
): GameState {
  const by: Record<PlayerId, CardInstance[]> = { player1: [], player2: [] };
  for (const m of moves) by[m.ownerId].push(m.card);
  return {
    ...state,
    players: {
      player1: {
        ...state.players.player1,
        trash: [...state.players.player1.trash, ...by.player1],
      },
      player2: {
        ...state.players.player2,
        trash: [...state.players.player2.trash, ...by.player2],
      },
    },
  };
}

/** 109 — clear temporary modifications when leaving board zones */
export function clearTemps(card: CardInstance): CardInstance {
  return {
    ...card,
    damage: 0,
    might: null,
    exhausted: false,
    stunned: false,
    buffs: 0,
    attachedTo: null,
  };
}

export { openShowdown, openCombat };
