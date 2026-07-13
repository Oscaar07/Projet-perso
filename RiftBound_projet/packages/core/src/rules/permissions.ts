import type { CardDefinition, GameState, PlayerAction, PlayerId } from "../types/game.js";
import { RulesViolation } from "../engine/errors.js";
import { hasKeyword } from "./keywords.js";

export type TimingClass = "reaction" | "action" | "default" | "limited";

export function cardTimingClass(def?: CardDefinition): TimingClass {
  if (!def) return "default";
  if (hasKeyword(def.keywords, def.tags, "REACTION")) return "reaction";
  if (hasKeyword(def.keywords, def.tags, "ACTION")) return "action";
  return "default";
}

function otherPlayer(id: PlayerId): PlayerId {
  return id === "player1" ? "player2" : "player1";
}

/**
 * Matrice 310 + Priority 312 + Focus 313 — gate unique pour actions discrétionnaires.
 */
export function assertDiscretionaryAllowed(
  state: GameState,
  playerId: PlayerId,
  opts: {
    timing: TimingClass;
    actionType: PlayerAction["type"];
    /** Limited actions bypass priority (312.1.b.1) when instructed */
    limited?: boolean;
  },
): void {
  if (state.cleanupInProgress && !opts.limited) {
    throw new RulesViolation(
      "CLEANUP_LOCKED",
      "Cleanup en cours : pas de Resolve / pass Priority-Focus (320).",
      "320",
    );
  }

  if (state.winnerId) {
    throw new RulesViolation("INVALID_ACTION", "Partie terminée.", "449");
  }

  if (opts.limited) return;

  // 312.1.b — no Priority ⇒ no Discretionary
  if (state.priorityPlayerId !== playerId) {
    throw new RulesViolation(
      "NO_PRIORITY",
      "Vous n'avez pas Priority — aucune Discretionary Action.",
      "312.1.b",
    );
  }

  const closed = state.openClosed === "closed" || state.closedState;
  const showdown = state.turnLayer === "showdown";

  if (closed) {
    // Neutral Closed / Showdown Closed — Reaction only
    if (opts.timing !== "reaction") {
      throw new RulesViolation(
        "REACTION_REQUIRED",
        "Closed State : seules les Reaction sont autorisées.",
        "309.1",
      );
    }
    return;
  }

  if (showdown) {
    // Showdown Open — Action or Reaction + Focus
    if (state.focusPlayerId !== playerId) {
      throw new RulesViolation(
        "NO_FOCUS",
        "Showdown Open : Focus requis (313.4).",
        "313.4",
      );
    }
    if (opts.timing !== "action" && opts.timing !== "reaction") {
      throw new RulesViolation(
        "INVALID_ACTION",
        "Showdown Open : seuls Action / Reaction (308.1.a / 338).",
        "338",
      );
    }
    return;
  }

  // Neutral Open — Turn Player (316.2.b), Action Phase for most plays
  if (
    opts.actionType === "PLAY_CARD" ||
    opts.actionType === "PLAY_FACEDOWN" ||
    opts.actionType === "HIDE" ||
    opts.actionType === "STANDARD_MOVE"
  ) {
    if (state.phase !== "action" && state.phase !== "closed") {
      throw new RulesViolation(
        "WRONG_PHASE",
        `Action Phase requise (phase actuelle: ${state.phase}).`,
        "316",
      );
    }
    if (playerId !== state.activePlayerId) {
      throw new RulesViolation(
        "NOT_YOUR_TURN",
        "Neutral Open : seul le Turn Player joue / active (316.2.b).",
        "316.2.b",
      );
    }
  }
}

export function grantPriority(state: GameState, playerId: PlayerId | null): GameState {
  return { ...state, priorityPlayerId: playerId };
}

export function grantFocus(state: GameState, playerId: PlayerId | null): GameState {
  // 313.2 — gain Focus ⇒ gain Priority
  if (playerId === null) {
    return { ...state, focusPlayerId: null };
  }
  return { ...state, focusPlayerId: playerId, priorityPlayerId: playerId };
}

export function passPriority(state: GameState, playerId: PlayerId): GameState {
  if (state.priorityPlayerId !== playerId) {
    throw new RulesViolation("NO_PRIORITY", "Pas votre Priority.", "312");
  }
  const next = otherPlayer(playerId);
  // 313.3 — Pass Priority ⇒ retain Focus
  return { ...state, priorityPlayerId: next };
}

export { otherPlayer };
