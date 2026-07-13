import type {
  CardDefinition,
  CardInstance,
  ChainEntry,
  GameState,
  PlayerAction,
  PlayerId,
  PlayerState,
} from "../types/game.js";
import type { CardCatalog } from "../types/factory.js";
import { effectiveMight } from "../types/factory.js";
import { RulesViolation, isRulesViolation } from "./errors.js";
import { assertCanPlaceFacedown } from "./guards/facedown.js";
import {
  assertPlayerExists,
  cardHasReactionTag,
  syncClosedState,
} from "./guards/chain.js";
import { runPaymentPipeline } from "./payment.js";
import { clearTemps, runCleanup, openShowdown, openCombat } from "./cleanup.js";
import { endTurn, drawCards, channelRunes, runStartOfTurn } from "./turn.js";
import { maybeConquer } from "./scoring.js";
import { OFFICIAL_GUIDE } from "../rules/officialGuide.js";
import {
  assertDiscretionaryAllowed,
  cardTimingClass,
  grantFocus,
  grantPriority,
  otherPlayer,
  passPriority,
} from "../rules/permissions.js";
import { hasKeyword, keywordValue } from "../rules/keywords.js";
import {
  assignCombatDamage,
  sumCombatOffense,
} from "./combatKeywords.js";

export interface ReduceContext {
  catalog: CardCatalog;
}

function shouldEnforce(state: GameState): boolean {
  return state.arbitrationMode === "coach";
}

function clearError(state: GameState): GameState {
  return state.lastError === null ? state : { ...state, lastError: null };
}

function withError(state: GameState, error: RulesViolation): GameState {
  return { ...state, lastError: error.toGameError() };
}

function getPlayer(state: GameState, playerId: PlayerId): PlayerState {
  return state.players[playerId];
}

function updatePlayer(
  state: GameState,
  playerId: PlayerId,
  updater: (p: PlayerState) => PlayerState,
): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: updater(state.players[playerId]),
    },
  };
}

function findInHand(
  player: PlayerState,
  instanceId: string,
): { card: CardInstance; index: number } {
  const index = player.hand.findIndex((c) => c.instanceId === instanceId);
  const card = player.hand[index];
  if (index < 0 || !card) {
    throw new RulesViolation(
      "CARD_NOT_IN_HAND",
      `Carte ${instanceId} absente de la main.`,
    );
  }
  return { card, index };
}

function requireCardDef(catalog: CardCatalog, cardId: string): CardDefinition {
  const def = catalog.get(cardId);
  if (!def) {
    throw new RulesViolation("UNKNOWN_CARD", `Carte catalogue inconnue: ${cardId}`);
  }
  return def;
}

function removeFromHand(player: PlayerState, index: number): PlayerState {
  return {
    ...player,
    hand: [...player.hand.slice(0, index), ...player.hand.slice(index + 1)],
  };
}

let chainIdCounter = 0;

function pushChain(
  state: GameState,
  entry: Omit<ChainEntry, "id">,
): GameState {
  chainIdCounter += 1;
  const next: ChainEntry = { ...entry, id: `chain_${chainIdCounter}` };
  let s = syncClosedState({
    ...state,
    chain: [...state.chain, next],
    chainStep: "finalize",
  });
  // 312.2.c — Closed: controller of newest item has Priority
  s = grantPriority(s, next.controllerId);
  return s;
}

function assertMatchStarted(state: GameState): void {
  if (!state.started) {
    throw new RulesViolation(
      "MATCH_NOT_STARTED",
      "Import des deux decks requis avant de jouer.",
    );
  }
}

function handlePlayFacedown(
  state: GameState,
  action: Extract<PlayerAction, { type: "PLAY_FACEDOWN" | "HIDE" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  const player = getPlayer(state, action.playerId);
  const { card, index } = findInHand(player, action.cardInstanceId);
  const def = requireCardDef(catalog, card.cardId);

  if (shouldEnforce(state)) {
    assertDiscretionaryAllowed(state, action.playerId, {
      timing: "default",
      actionType: "HIDE",
    });
    // 737 / 408 — Hidden keyword preferred; Atlas PLAY_FACEDOWN still allowed in training
    if (action.type === "HIDE" && !hasKeyword(def.keywords, def.tags, "HIDDEN")) {
      throw new RulesViolation(
        "INVALID_ACTION",
        "Hide requiert le keyword Hidden (737 / 408).",
        "408.2.a",
      );
    }
    assertCanPlaceFacedown(state, action.playerId, action.battlefieldId);
  }

  const facedownCard: CardInstance = { ...card, faceDown: true };
  let next = updatePlayer(state, action.playerId, (p) => removeFromHand(p, index));
  next = {
    ...next,
    battlefields: next.battlefields.map((bf) =>
      bf.id === action.battlefieldId
        ? { ...bf, facedown: { card: facedownCard } }
        : bf,
    ),
  };
  return clearError(runCleanup(next, catalog));
}

function handlePlayCard(
  state: GameState,
  action: Extract<PlayerAction, { type: "PLAY_CARD" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  const player = getPlayer(state, action.playerId);
  const { card, index } = findInHand(player, action.cardInstanceId);
  const def = requireCardDef(catalog, card.cardId);
  const timing = cardTimingClass(def);

  if (shouldEnforce(state)) {
    assertDiscretionaryAllowed(state, action.playerId, {
      timing,
      actionType: "PLAY_CARD",
    });
    if (def.type === "Spell" && timing !== "reaction" && state.turnLayer === "showdown") {
      throw new RulesViolation(
        "INVALID_ACTION",
        "Spell non-Reaction hors Showdown Open Action/Reaction only.",
        "151",
      );
    }
  }

  // 731 Accelerate — optional +1E +1P, enter ready
  const wantsAccelerate =
    Boolean(action.accelerate) &&
    def.type === "Unit" &&
    hasKeyword(def.keywords, def.tags, "ACCELERATE");
  let cost = { ...def.cost };
  if (wantsAccelerate) {
    cost = { energy: cost.energy + 1, power: cost.power + 1 };
  }

  // 735 Deflect — +Power per targeted permanent with Deflect (opponent's)
  for (const tid of action.targets ?? []) {
    try {
      const loc = findCardLocation(state, tid);
      const tdef = catalog.get(loc.card.cardId);
      if (
        tdef &&
        loc.card.controllerId !== action.playerId &&
        hasKeyword(tdef.keywords, tdef.tags, "DEFLECT")
      ) {
        cost = {
          ...cost,
          power: cost.power + keywordValue(tdef.keywords, tdef.tags, "DEFLECT"),
        };
      }
    } catch {
      /* target may not be on board yet */
    }
  }

  let runes = player.runes;
  if (shouldEnforce(state)) {
    runes = runPaymentPipeline(player.runes, cost, action.targets ?? []).runes;
  } else if (
    player.runes.energy >= cost.energy &&
    player.runes.power >= cost.power
  ) {
    runes = runPaymentPipeline(player.runes, cost, action.targets ?? []).runes;
  }

  // Ambush destination
  let dest = action.destination;
  if (action.ambushBattlefieldId) {
    if (shouldEnforce(state) && !hasKeyword(def.keywords, def.tags, "AMBUSH")) {
      throw new RulesViolation(
        "INVALID_ACTION",
        "Ambush requis pour ce déploiement.",
        "keyword.Ambush",
      );
    }
    const bf = state.battlefields.find((b) => b.id === action.ambushBattlefieldId);
    const hasFriendly = bf?.units.some((u) => u.controllerId === action.playerId);
    if (shouldEnforce(state) && !hasFriendly) {
      throw new RulesViolation(
        "INVALID_TARGET",
        "Ambush : vous devez déjà avoir des unités sur ce Battlefield.",
        "keyword.Ambush",
      );
    }
    dest = { kind: "battlefield", battlefieldId: action.ambushBattlefieldId };
  }

  const enterExhausted = def.type === "Unit" && !wantsAccelerate;

  let next = updatePlayer(state, action.playerId, (p) => {
    const after = { ...removeFromHand(p, index), runes };
    if (def.type === "Spell" || (timing === "reaction" && def.type === "Spell")) {
      return after;
    }
    if (def.type === "Unit" || def.type === "Gear") {
      const placed: CardInstance = {
        ...card,
        faceDown: false,
        exhausted: enterExhausted,
        might: def.might ?? null,
      };
      if (dest?.kind === "battlefield") {
        return after;
      }
      return { ...after, base: [...p.base, placed] };
    }
    return after;
  });

  if ((def.type === "Unit" || def.type === "Gear") && dest?.kind === "battlefield") {
    const bfId = dest.battlefieldId;
    const bf = next.battlefields.find((b) => b.id === bfId);
    if (
      shouldEnforce(state) &&
      !action.ambushBattlefieldId &&
      bf?.controllerId !== action.playerId
    ) {
      throw new RulesViolation(
        "INVALID_TARGET",
        "Unit/Gear : Battlefield contrôlé requis (ou Base).",
        "352",
      );
    }
    const placed: CardInstance = {
      ...card,
      faceDown: false,
      exhausted: enterExhausted,
      might: def.might ?? null,
    };
    next = {
      ...next,
      battlefields: next.battlefields.map((b) =>
        b.id === bfId ? { ...b, units: [...b.units, placed] } : b,
      ),
    };
  }

  if (def.type === "Spell" || timing === "reaction") {
    next = pushChain(next, {
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
      controllerId: action.playerId,
      isReaction: timing === "reaction",
      pending: false,
      description: `${def.name} effect`,
      kind: "spell",
    });
    next = updatePlayer(next, action.playerId, (p) => ({
      ...p,
      trash: [...p.trash, clearTemps({ ...card, faceDown: false })],
    }));
  }

  // Legion tracking — Main Deck card played
  next = {
    ...next,
    mainDeckCardsPlayedThisTurn: {
      ...next.mainDeckCardsPlayedThisTurn,
      [action.playerId]:
        (next.mainDeckCardsPlayedThisTurn[action.playerId] ?? 0) + 1,
    },
  };

  if (next.showdown) {
    next = {
      ...next,
      showdown: { ...next.showdown, passStreak: [] },
    };
  }

  return clearError(syncClosedState(next));
}

function handlePassPriority(
  state: GameState,
  action: Extract<PlayerAction, { type: "PASS_PRIORITY" }>,
): GameState {
  assertPlayerExists(state, action.playerId);
  if (state.closedState && state.chain.length > 0) {
    // 335 — if not all passed, give priority to other; sandbox QoL: resolve top when both would pass
    const afterPass = passPriority(state, action.playerId);
    // Simplification: resolve top after pass in closed (training)
    return handleResolveChainTop(afterPass, {
      type: "RESOLVE_CHAIN_TOP",
      playerId: action.playerId,
    });
  }
  const next = passPriority(state, action.playerId);
  return clearError(next);
}

function handlePassFocus(
  state: GameState,
  action: Extract<PlayerAction, { type: "PASS_FOCUS" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  if (state.turnLayer !== "showdown" || !state.showdown) {
    throw new RulesViolation(
      "INVALID_ACTION",
      "Pass Focus uniquement en Showdown.",
      "344",
    );
  }
  if (state.focusPlayerId !== action.playerId) {
    throw new RulesViolation("NO_FOCUS", "Pas votre Focus.", "313");
  }
  const streak = [...state.showdown.passStreak, action.playerId];
  const bothPassed =
    streak.includes("player1") && streak.includes("player2");
  if (bothPassed) {
    // 345 — Showdown closes → Cleanup
    let next: GameState = {
      ...state,
      turnLayer: "neutral",
      showdown: null,
      focusPlayerId: null,
      priorityPlayerId: state.activePlayerId,
    };
    if (state.combat?.step === "showdown") {
      next = {
        ...next,
        combat: { ...state.combat, step: "damage" },
        phase: "combat_damage",
        turnLayer: "neutral",
      };
    }
    return clearError(runCleanup(next, catalog));
  }
  const nextPlayer = otherPlayer(action.playerId);
  return clearError(
    grantFocus(
      {
        ...state,
        showdown: { ...state.showdown, passStreak: streak },
      },
      nextPlayer,
    ),
  );
}

function handleResolveChainTop(
  state: GameState,
  action: Extract<PlayerAction, { type: "RESOLVE_CHAIN_TOP" }>,
): GameState {
  assertPlayerExists(state, action.playerId);
  if (state.cleanupInProgress) {
    throw new RulesViolation(
      "CLEANUP_LOCKED",
      "Pas de Resolve pendant Cleanup (320).",
      "320",
    );
  }
  if (state.chain.length === 0) {
    throw new RulesViolation(
      "INVALID_ACTION",
      "The Chain est vide — rien à résoudre.",
      "336",
    );
  }
  const chain = state.chain.slice(0, -1);
  let next = syncClosedState({ ...state, chain, chainStep: chain.length ? "execute" : "idle" });
  if (chain.length > 0) {
    const top = chain[chain.length - 1]!;
    next = grantPriority(next, top.controllerId);
  } else {
    next = grantPriority(next, state.activePlayerId);
    // 343 — after last item in Showdown, Focus passes
    if (next.showdown && !(next.combat?.initialChain)) {
      const fp = next.focusPlayerId ?? action.playerId;
      next = grantFocus(next, otherPlayer(fp));
    }
    next = runCleanup(next);
  }
  return clearError(next);
}

function handleSetBattlefieldController(
  state: GameState,
  action: Extract<PlayerAction, { type: "SET_BATTLEFIELD_CONTROLLER" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  const exists = state.battlefields.some((bf) => bf.id === action.battlefieldId);
  if (!exists) {
    throw new RulesViolation(
      "INVALID_TARGET",
      `Battlefield "${action.battlefieldId}" introuvable.`,
    );
  }
  const next = runCleanup(
    {
      ...state,
      battlefields: state.battlefields.map((bf) =>
        bf.id === action.battlefieldId
          ? {
              ...bf,
              controllerId: action.controllerId,
              contested: false,
              contestedBy: null,
            }
          : bf,
      ),
    },
    catalog,
  );
  return clearError(next);
}

type CardLocation =
  | { where: "hand" | "deck" | "trash" | "base" | "runeBoard"; ownerId: PlayerId; index: number; card: CardInstance }
  | { where: "battlefield_units"; battlefieldId: string; index: number; card: CardInstance }
  | { where: "battlefield_facedown"; battlefieldId: string; card: CardInstance };

function findCardLocation(state: GameState, instanceId: string): CardLocation {
  for (const pid of ["player1", "player2"] as const) {
    const p = state.players[pid];
    for (const zone of ["hand", "deck", "trash", "base", "runeBoard"] as const) {
      const index = p[zone].findIndex((c) => c.instanceId === instanceId);
      if (index >= 0) {
        return { where: zone, ownerId: pid, index, card: p[zone][index]! };
      }
    }
  }
  for (const bf of state.battlefields) {
    const unitIdx = bf.units.findIndex((c) => c.instanceId === instanceId);
    if (unitIdx >= 0) {
      return {
        where: "battlefield_units",
        battlefieldId: bf.id,
        index: unitIdx,
        card: bf.units[unitIdx]!,
      };
    }
    if (bf.facedown.card?.instanceId === instanceId) {
      return {
        where: "battlefield_facedown",
        battlefieldId: bf.id,
        card: bf.facedown.card,
      };
    }
  }
  throw new RulesViolation("INVALID_TARGET", `Carte ${instanceId} introuvable.`);
}

function extractCard(state: GameState, loc: CardLocation): GameState {
  switch (loc.where) {
    case "hand":
    case "deck":
    case "trash":
    case "base":
    case "runeBoard":
      return updatePlayer(state, loc.ownerId, (p) => ({
        ...p,
        [loc.where]: [
          ...p[loc.where].slice(0, loc.index),
          ...p[loc.where].slice(loc.index + 1),
        ],
      }));
    case "battlefield_units":
      return {
        ...state,
        battlefields: state.battlefields.map((bf) =>
          bf.id === loc.battlefieldId
            ? {
                ...bf,
                units: [
                  ...bf.units.slice(0, loc.index),
                  ...bf.units.slice(loc.index + 1),
                ],
              }
            : bf,
        ),
      };
    case "battlefield_facedown":
      return {
        ...state,
        battlefields: state.battlefields.map((bf) =>
          bf.id === loc.battlefieldId ? { ...bf, facedown: { card: null } } : bf,
        ),
      };
  }
}

function handleMoveCard(
  state: GameState,
  action: Extract<PlayerAction, { type: "MOVE_CARD" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  if (shouldEnforce(state) && state.closedState) {
    throw new RulesViolation(
      "REACTION_REQUIRED",
      "MOVE_CARD Atlas bloqué en Closed State.",
      "309.1",
    );
  }

  const loc = findCardLocation(state, action.cardInstanceId);
  let card = loc.card;
  let next = extractCard(state, loc);
  const { to } = action;

  if (to.kind === "battlefield_facedown") {
    if (shouldEnforce(state)) {
      assertCanPlaceFacedown(next, action.playerId, to.battlefieldId);
    }
    card = { ...card, faceDown: true };
    next = {
      ...next,
      battlefields: next.battlefields.map((bf) =>
        bf.id === to.battlefieldId ? { ...bf, facedown: { card } } : bf,
      ),
    };
  } else if (to.kind === "battlefield_units") {
    card = { ...card, faceDown: false };
    next = {
      ...next,
      battlefields: next.battlefields.map((bf) => {
        if (bf.id !== to.battlefieldId) return bf;
        const contested =
          bf.controllerId !== null && bf.controllerId !== action.playerId
            ? true
            : bf.controllerId === null;
        return {
          ...bf,
          units: [...bf.units, card],
          contested: contested || bf.contested,
          contestedBy: contested ? action.playerId : bf.contestedBy,
        };
      }),
    };
    const bf = next.battlefields.find((b) => b.id === to.battlefieldId)!;
    if (!bf.units.some((u) => u.controllerId !== action.playerId)) {
      next = maybeConquer(next, to.battlefieldId, action.playerId);
    }
  } else {
    card =
      to.kind === "hand" || to.kind === "deck" || to.kind === "trash"
        ? clearTemps({ ...card, faceDown: false })
        : { ...card, faceDown: false };
    next = updatePlayer(next, to.ownerId, (p) => ({
      ...p,
      [to.kind]: [...p[to.kind], card],
    }));
  }

  return clearError(runCleanup(next, catalog));
}

function handleStandardMove(
  state: GameState,
  action: Extract<PlayerAction, { type: "STANDARD_MOVE" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  if (shouldEnforce(state)) {
    assertDiscretionaryAllowed(state, action.playerId, {
      timing: "default",
      actionType: "STANDARD_MOVE",
    });
    if (state.closedState || state.turnLayer === "showdown") {
      throw new RulesViolation(
        "ILLEGAL_MOVE",
        "Standard Move : Action Phase, pas Closed, pas Showdown (143.1).",
        "143.1",
      );
    }
  }

  let next = state;
  const moved: CardInstance[] = [];

  for (const id of action.unitInstanceIds) {
    const loc = findCardLocation(next, id);
    const def = catalog.get(loc.card.cardId);
    if (shouldEnforce(state)) {
      if (loc.card.controllerId !== action.playerId) {
        throw new RulesViolation("ILLEGAL_MOVE", "Vous ne contrôlez pas cette Unit.", "185");
      }
      if (loc.card.exhausted) {
        throw new RulesViolation(
          "ALREADY_EXHAUSTED",
          "Unit déjà Exhaust — coût Standard Move impossible.",
          "143.2",
        );
      }
      // BF→BF requires Ganking
      if (
        loc.where === "battlefield_units" &&
        action.destination.kind === "battlefield" &&
        loc.battlefieldId !== action.destination.battlefieldId
      ) {
        if (!def || !hasKeyword(def.keywords, def.tags, "GANKING")) {
          throw new RulesViolation(
            "ILLEGAL_MOVE",
            "BF→BF Standard Move requiert Ganking (143.4).",
            "143.4",
          );
        }
      }
    }
    const card = { ...loc.card, exhausted: true };
    next = extractCard(next, loc);
    moved.push(card);
  }

  if (action.destination.kind === "base") {
    next = updatePlayer(next, action.playerId, (p) => ({
      ...p,
      base: [...p.base, ...moved],
    }));
    return clearError(runCleanup(next, catalog));
  }

  const bfId = action.destination.battlefieldId;
  next = {
    ...next,
    battlefields: next.battlefields.map((bf) => {
      if (bf.id !== bfId) return bf;
      const notOurs =
        bf.controllerId !== null && bf.controllerId !== action.playerId;
      const uncontrolled = bf.controllerId === null;
      return {
        ...bf,
        units: [...bf.units, ...moved],
        contested: notOurs || uncontrolled || bf.contested,
        contestedBy:
          notOurs || uncontrolled ? action.playerId : bf.contestedBy,
      };
    }),
  };

  // Empty BF / sole controller → Conquer (Guide officiel)
  if (
    !next.battlefields
      .find((b) => b.id === bfId)!
      .units.some((u) => u.controllerId !== action.playerId)
  ) {
    next = maybeConquer(next, bfId, action.playerId);
  }

  return clearError(runCleanup(next, catalog));
}

function findUnit(state: GameState, instanceId: string): {
  card: CardInstance;
  patch: (c: CardInstance) => GameState;
} {
  for (const pid of ["player1", "player2"] as const) {
    const idx = state.players[pid].base.findIndex((c) => c.instanceId === instanceId);
    if (idx >= 0) {
      const card = state.players[pid].base[idx]!;
      return {
        card,
        patch: (c) =>
          updatePlayer(state, pid, (p) => ({
            ...p,
            base: p.base.map((x, i) => (i === idx ? c : x)),
          })),
      };
    }
  }
  for (const bf of state.battlefields) {
    const idx = bf.units.findIndex((c) => c.instanceId === instanceId);
    if (idx >= 0) {
      const card = bf.units[idx]!;
      return {
        card,
        patch: (c) => ({
          ...state,
          battlefields: state.battlefields.map((b) =>
            b.id === bf.id
              ? { ...b, units: b.units.map((x, i) => (i === idx ? c : x)) }
              : b,
          ),
        }),
      };
    }
  }
  throw new RulesViolation("INVALID_TARGET", `Unit ${instanceId} introuvable.`);
}

function handleDealDamage(
  state: GameState,
  action: Extract<PlayerAction, { type: "DEAL_DAMAGE" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  const { card, patch } = findUnit(state, action.targetInstanceId);
  const next = patch({ ...card, damage: card.damage + action.amount });
  return clearError(runCleanup(next, catalog));
}

function handleKill(
  state: GameState,
  action: Extract<PlayerAction, { type: "KILL" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  const loc = findCardLocation(state, action.targetInstanceId);
  let next = extractCard(state, loc);
  next = updatePlayer(next, loc.card.ownerId, (p) => ({
    ...p,
    trash: [...p.trash, clearTemps({ ...loc.card, faceDown: false })],
  }));
  return clearError(runCleanup(next, catalog));
}

function handleHeal(
  state: GameState,
  action: Extract<PlayerAction, { type: "HEAL" }>,
): GameState {
  assertPlayerExists(state, action.playerId);
  if (action.all) {
    const heal = (cards: CardInstance[]) =>
      cards.map((c) => ({ ...c, damage: 0 }));
    return clearError({
      ...state,
      players: {
        player1: { ...state.players.player1, base: heal(state.players.player1.base) },
        player2: { ...state.players.player2, base: heal(state.players.player2.base) },
      },
      battlefields: state.battlefields.map((bf) => ({
        ...bf,
        units: heal(bf.units),
      })),
    });
  }
  if (!action.targetInstanceId) {
    throw new RulesViolation("INVALID_TARGET", "Cible Heal manquante.", "405");
  }
  const { card, patch } = findUnit(state, action.targetInstanceId);
  return clearError(patch({ ...card, damage: 0 }));
}

function handleAdvanceCombat(
  state: GameState,
  action: Extract<PlayerAction, { type: "ADVANCE_COMBAT" }>,
  catalog: CardCatalog,
): GameState {
  assertPlayerExists(state, action.playerId);
  if (!state.combat) {
    throw new RulesViolation("COMBAT_REQUIRED", "Pas de Combat en cours.", "441");
  }
  const c = state.combat;
  if (c.step === "showdown") {
    return clearError({
      ...state,
      combat: { ...c, step: "damage", initialChain: false },
      phase: "combat_damage",
      turnLayer: "neutral",
      showdown: null,
    });
  }
  if (c.step === "damage") {
    const bf = state.battlefields.find((b) => b.id === c.battlefieldId);
    if (!bf) throw new RulesViolation("INVALID_TARGET", "BF combat manquant.");
    const catalogMap = new Map(catalog);
    const atkMight = sumCombatOffense(
      bf.units,
      "attacker",
      c.attackerId,
      catalogMap,
    );
    const defMight = sumCombatOffense(
      bf.units,
      "defender",
      c.defenderId,
      catalogMap,
    );
    const defenders = bf.units.filter((u) => u.controllerId === c.defenderId);
    const attackers = bf.units.filter((u) => u.controllerId === c.attackerId);
    const newDefenders = assignCombatDamage(defenders, atkMight, catalogMap);
    const newAttackers = assignCombatDamage(attackers, defMight, catalogMap);
    const byId = new Map(
      [...newDefenders, ...newAttackers].map((u) => [u.instanceId, u]),
    );
    let next: GameState = {
      ...state,
      battlefields: state.battlefields.map((b) => {
        if (b.id !== c.battlefieldId) return b;
        return {
          ...b,
          units: b.units.map((u) => byId.get(u.instanceId) ?? u),
        };
      }),
      combat: { ...c, step: "resolution" },
      phase: "combat_resolution",
    };
    return clearError(runCleanup(next, catalog));
  }
  // resolution — clear combat
  let next: GameState = {
    ...state,
    combat: null,
    phase: "action",
    turnLayer: "neutral",
    battlefields: state.battlefields.map((b) =>
      b.id === c.battlefieldId
        ? { ...b, attackerId: null, defenderId: null, contested: false, contestedBy: null }
        : b,
    ),
  };
  return clearError(runCleanup(next, catalog));
}

function handleConcede(
  state: GameState,
  action: Extract<PlayerAction, { type: "CONCEDE" }>,
): GameState {
  assertPlayerExists(state, action.playerId);
  const winner = otherPlayer(action.playerId);
  return clearError({
    ...state,
    winnerId: winner,
    phase: "ended",
  });
}

function handleAdjustScore(
  state: GameState,
  action: Extract<PlayerAction, { type: "ADJUST_SCORE" }>,
): GameState {
  assertPlayerExists(state, action.playerId);
  assertPlayerExists(state, action.targetPlayerId);
  const p = state.players[action.targetPlayerId];
  if (
    shouldEnforce(state) &&
    action.battlefieldId &&
    action.delta > 0 &&
    p.scoredBattlefieldIdsThisTurn.includes(action.battlefieldId)
  ) {
    throw new RulesViolation(
      "INVALID_ACTION",
      "Score once per Battlefield per turn (447).",
      "447",
    );
  }
  let next = updatePlayer(state, action.targetPlayerId, (pl) => ({
    ...pl,
    score: Math.max(0, pl.score + action.delta),
    scoredBattlefieldIdsThisTurn:
      action.battlefieldId && action.delta > 0
        ? [...pl.scoredBattlefieldIdsThisTurn, action.battlefieldId]
        : pl.scoredBattlefieldIdsThisTurn,
  }));
  if (next.players[action.targetPlayerId].score >= next.victoryScore) {
    next = {
      ...next,
      winnerId: action.targetPlayerId,
      phase: "ended",
    };
  }
  return clearError(next);
}

/**
 * Réducteur isomorphe — arbitrage coach = matrice d'états + guards PDF.
 */
export function gameReducer(
  state: GameState,
  action: PlayerAction,
  ctx: ReduceContext,
): GameState {
  try {
    if (action.type === "REWIND") {
      throw new RulesViolation(
        "NOTHING_TO_REWIND",
        "Rewind est appliqué par le serveur de session.",
      );
    }

    if (action.type !== "SET_ARBITRATION_MODE") {
      assertMatchStarted(state);
    }

    switch (action.type) {
      case "PLAY_FACEDOWN":
      case "HIDE":
        return handlePlayFacedown(state, action, ctx.catalog);
      case "PLAY_CARD":
        return handlePlayCard(state, action, ctx.catalog);
      case "PASS_PRIORITY":
        return handlePassPriority(state, action);
      case "PASS_FOCUS":
        return handlePassFocus(state, action, ctx.catalog);
      case "RESOLVE_CHAIN_TOP":
        return handleResolveChainTop(state, action);
      case "SET_BATTLEFIELD_CONTROLLER":
        return handleSetBattlefieldController(state, action, ctx.catalog);
      case "MOVE_CARD":
        return handleMoveCard(state, action, ctx.catalog);
      case "STANDARD_MOVE":
        return handleStandardMove(state, action, ctx.catalog);
      case "EXHAUST": {
        assertPlayerExists(state, action.playerId);
        const loc = findCardLocation(state, action.cardInstanceId);
        if (loc.card.exhausted) {
          throw new RulesViolation(
            "ALREADY_EXHAUSTED",
            "Déjà Exhaust (401.1).",
            "401",
          );
        }
        const next = extractCard(state, loc);
        const card = { ...loc.card, exhausted: true };
        if (loc.where === "battlefield_units") {
          return clearError({
            ...next,
            battlefields: next.battlefields.map((bf) =>
              bf.id === loc.battlefieldId
                ? { ...bf, units: [...bf.units, card] }
                : bf,
            ),
          });
        }
        if (loc.where === "base" || loc.where === "runeBoard") {
          return clearError(
            updatePlayer(next, loc.ownerId, (p) => ({
              ...p,
              [loc.where]: [...p[loc.where], card],
            })),
          );
        }
        throw new RulesViolation("INVALID_TARGET", "Exhaust cible invalide.", "401");
      }
      case "READY": {
        assertPlayerExists(state, action.playerId);
        const { card, patch } = findUnit(state, action.cardInstanceId);
        return clearError(patch({ ...card, exhausted: false }));
      }
      case "CHANNEL":
        assertPlayerExists(state, action.playerId);
        return clearError(channelRunes(state, action.playerId, action.count ?? 2));
      case "DRAW":
        assertPlayerExists(state, action.playerId);
        return clearError(drawCards(state, action.playerId, action.count ?? 1));
      case "ADD_TO_POOL": {
        assertPlayerExists(state, action.playerId);
        // 416 Add — limited; allowed during pay costs even as Reaction
        let next = state;
        if (action.exhaustInstanceId) {
          const loc = findCardLocation(next, action.exhaustInstanceId);
          if (loc.card.exhausted) {
            throw new RulesViolation("ALREADY_EXHAUSTED", "Rune déjà Exhaust.", "401");
          }
          next = extractCard(next, loc);
          const card = { ...loc.card, exhausted: true };
          next = updatePlayer(next, action.playerId, (p) => ({
            ...p,
            runeBoard: [...p.runeBoard, card],
            runes: {
              ...p.runes,
              energy: p.runes.energy + (action.energy ?? 1),
            },
          }));
        } else if (action.energy) {
          next = updatePlayer(next, action.playerId, (p) => ({
            ...p,
            runes: { ...p.runes, energy: p.runes.energy + action.energy! },
          }));
        }
        if (action.recycleInstanceId) {
          const loc = findCardLocation(next, action.recycleInstanceId);
          next = extractCard(next, loc);
          next = updatePlayer(next, action.playerId, (p) => ({
            ...p,
            runeDeck: [...p.runeDeck, clearTemps(loc.card)],
            runes: {
              ...p.runes,
              power: p.runes.power + (action.power ?? 1),
            },
          }));
        } else if (action.power) {
          next = updatePlayer(next, action.playerId, (p) => ({
            ...p,
            runes: { ...p.runes, power: p.runes.power + action.power! },
          }));
        }
        return clearError(next);
      }
      case "DEAL_DAMAGE":
        return handleDealDamage(state, action, ctx.catalog);
      case "HEAL":
        return handleHeal(state, action);
      case "KILL":
        return handleKill(state, action, ctx.catalog);
      case "ADVANCE_PHASE":
      case "END_TURN":
        return clearError(endTurn(state, action.playerId, ctx.catalog));
      case "MULLIGAN": {
        assertPlayerExists(state, action.playerId);
        if (state.phase !== "mulligan") {
          throw new RulesViolation(
            "WRONG_PHASE",
            "Mulligan uniquement en phase mulligan (Guide officiel).",
            "117",
          );
        }
        if (state.mulliganDone[action.playerId]) {
          throw new RulesViolation(
            "INVALID_ACTION",
            "Mulligan déjà effectué.",
            "117",
          );
        }
        if (action.cardInstanceIds.length > OFFICIAL_GUIDE.mulliganMax) {
          throw new RulesViolation(
            "INVALID_ACTION",
            `Mulligan max ${OFFICIAL_GUIDE.mulliganMax} cartes.`,
            "117",
          );
        }
        const p0 = state.players[action.playerId];
        for (const id of action.cardInstanceIds) {
          if (!p0.hand.some((c) => c.instanceId === id)) {
            throw new RulesViolation(
              "CARD_NOT_IN_HAND",
              `Carte ${id} absente de la main.`,
            );
          }
        }
        const keep = p0.hand.filter(
          (c) => !action.cardInstanceIds.includes(c.instanceId),
        );
        const recycled = p0.hand.filter((c) =>
          action.cardInstanceIds.includes(c.instanceId),
        );
        const deck = [
          ...p0.deck,
          ...recycled.map((c) => ({ ...c, faceDown: true })),
        ];
        const drawn = deck.splice(0, recycled.length);
        let next = updatePlayer(state, action.playerId, () => ({
          ...p0,
          hand: [...keep, ...drawn],
          deck,
        }));
        next = {
          ...next,
          mulliganDone: { ...next.mulliganDone, [action.playerId]: true },
        };
        if (next.mulliganDone.player1 && next.mulliganDone.player2) {
          next = runStartOfTurn(next, next.firstPlayerId, ctx.catalog);
        }
        return clearError(next);
      }
      case "OPEN_SHOWDOWN": {
        assertPlayerExists(state, action.playerId);
        return clearError(openShowdown(state, action.battlefieldId));
      }
      case "CLOSE_SHOWDOWN":
        return handlePassFocus(
          state,
          { type: "PASS_FOCUS", playerId: action.playerId },
          ctx.catalog,
        );
      case "BEGIN_COMBAT": {
        assertPlayerExists(state, action.playerId);
        if (action.playerId !== state.activePlayerId) {
          throw new RulesViolation("NOT_YOUR_TURN", "Turn Player choisit le Combat.", "322.14");
        }
        return clearError(openCombat(state, action.battlefieldId));
      }
      case "ADVANCE_COMBAT":
        return handleAdvanceCombat(state, action, ctx.catalog);
      case "CONCEDE":
        return handleConcede(state, action);
      case "ADJUST_RUNES": {
        assertPlayerExists(state, action.playerId);
        assertPlayerExists(state, action.targetPlayerId);
        const clamp = (n: number) => Math.max(0, n);
        return clearError(
          updatePlayer(state, action.targetPlayerId, (p) => ({
            ...p,
            runes: {
              energy: clamp(p.runes.energy + (action.energyDelta ?? 0)),
              power: clamp(p.runes.power + (action.powerDelta ?? 0)),
              exhaustedEnergy: clamp(
                p.runes.exhaustedEnergy + (action.exhaustedDelta ?? 0),
              ),
            },
          })),
        );
      }
      case "ADJUST_LIFE": {
        assertPlayerExists(state, action.playerId);
        assertPlayerExists(state, action.targetPlayerId);
        return clearError(
          updatePlayer(state, action.targetPlayerId, (p) => ({
            ...p,
            life: Math.max(0, p.life + action.delta),
          })),
        );
      }
      case "ADJUST_SCORE":
        return handleAdjustScore(state, action);
      case "RUN_CLEANUP":
        assertPlayerExists(state, action.playerId);
        return clearError(runCleanup(state, ctx.catalog));
      case "PREDICT": {
        assertPlayerExists(state, action.playerId);
        const count = Math.max(1, action.count ?? 1);
        const p = state.players[action.playerId];
        const looked = p.deck.slice(0, count);
        if (looked.length === 0) {
          throw new RulesViolation(
            "INVALID_ACTION",
            "Deck vide — Predict impossible.",
            "keyword.Predict",
          );
        }
        const recycleSet = new Set(action.recycleIndices ?? []);
        const recycled: CardInstance[] = [];
        const rest: CardInstance[] = [];
        looked.forEach((c, i) => {
          if (recycleSet.has(i)) recycled.push({ ...c, faceDown: true });
          else rest.push(c);
        });
        const next = updatePlayer(state, action.playerId, (pl) => ({
          ...pl,
          deck: [...rest, ...pl.deck.slice(count), ...recycled],
        }));
        return clearError(next);
      }
      case "STUN": {
        assertPlayerExists(state, action.playerId);
        const { card, patch } = findUnit(state, action.targetInstanceId);
        if (card.stunned) {
          // 410.1.a.1 — already stunned: legal target but no re-stun effect
          return clearError(state);
        }
        return clearError(patch({ ...card, stunned: true }));
      }
      case "SET_ARBITRATION_MODE":
        assertPlayerExists(state, action.playerId);
        return clearError({ ...state, arbitrationMode: action.mode });
      default: {
        const _exhaustive: never = action;
        void _exhaustive;
        throw new RulesViolation("INVALID_ACTION", "Action non reconnue.");
      }
    }
  } catch (error) {
    if (isRulesViolation(error)) {
      return withError(state, error);
    }
    throw error;
  }
}

export function wasActionRejected(prev: GameState, next: GameState): boolean {
  return next.lastError !== null && next.matchId === prev.matchId;
}
