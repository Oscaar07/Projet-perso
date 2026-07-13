import type { CardDefinition, GameState, PlayerAction } from "../../types/game.js";
import { RulesViolation } from "../errors.js";
import { hasKeyword } from "../../rules/keywords.js";

export function syncClosedState(state: GameState): GameState {
  const closed = state.chain.length > 0;
  const openClosed = closed ? "closed" : "open";
  let phase = state.phase;
  if (closed && phase === "action") phase = "closed";
  if (!closed && phase === "closed") phase = "action";

  if (
    state.closedState === closed &&
    state.openClosed === openClosed &&
    state.phase === phase
  ) {
    return state;
  }
  return {
    ...state,
    closedState: closed,
    openClosed,
    phase,
    chainStep: closed
      ? state.chainStep === "idle"
        ? "execute"
        : state.chainStep
      : "idle",
  };
}

export function cardHasReactionTag(card: CardDefinition | undefined): boolean {
  if (!card) return false;
  return hasKeyword(card.keywords, card.tags, "REACTION");
}

/** Legacy helper — prefer assertDiscretionaryAllowed. */
export function assertActionAllowedInClosedState(
  state: GameState,
  action: PlayerAction,
  card?: CardDefinition,
): void {
  if (!state.closedState && state.openClosed !== "closed") return;

  if (
    action.type === "PASS_PRIORITY" ||
    action.type === "PASS_FOCUS" ||
    action.type === "RESOLVE_CHAIN_TOP" ||
    action.type === "ADJUST_RUNES" ||
    action.type === "ADJUST_LIFE" ||
    action.type === "ADJUST_SCORE" ||
    action.type === "REWIND" ||
    action.type === "RUN_CLEANUP" ||
    action.type === "ADD_TO_POOL"
  ) {
    return;
  }

  if (action.type === "PLAY_CARD" && cardHasReactionTag(card)) {
    return;
  }

  throw new RulesViolation(
    "REACTION_REQUIRED",
    "Closed State (The Chain exists). Only Reaction cards/abilities may be played or activated.",
    "309.1",
  );
}

export function assertPlayerExists(
  state: GameState,
  playerId: string,
): void {
  if (!(playerId in state.players)) {
    throw new RulesViolation("INVALID_ACTION", `Joueur inconnu: ${playerId}`);
  }
}
