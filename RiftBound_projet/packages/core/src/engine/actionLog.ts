import type { ActionLogEntry, GameState, PlayerAction, PlayerId } from "../types/game.js";

export type { ActionLogEntry };

let logCounter = 0;

export function resetLogCounter(seed = 0): void {
  logCounter = seed;
}

export function describeAction(action: PlayerAction): string {
  switch (action.type) {
    case "PLAY_CARD":
      return `Played card ${action.cardInstanceId}`;
    case "PLAY_FACEDOWN":
    case "HIDE":
      return `Facedown/Hide on ${action.battlefieldId}`;
    case "MOVE_CARD":
      return `Moved ${action.cardInstanceId} → ${action.to.kind}`;
    case "STANDARD_MOVE":
      return `Standard Move → ${action.destination.kind}`;
    case "ADJUST_RUNES": {
      const parts: string[] = [];
      if (action.energyDelta) parts.push(`E${action.energyDelta > 0 ? "+" : ""}${action.energyDelta}`);
      if (action.powerDelta) parts.push(`P${action.powerDelta > 0 ? "+" : ""}${action.powerDelta}`);
      if (action.exhaustedDelta) {
        parts.push(`X${action.exhaustedDelta > 0 ? "+" : ""}${action.exhaustedDelta}`);
      }
      return `Adjusted runes (${action.targetPlayerId}: ${parts.join(" ") || "0"})`;
    }
    case "ADJUST_LIFE":
      return `Adjusted life ${action.targetPlayerId} ${action.delta > 0 ? "+" : ""}${action.delta}`;
    case "ADJUST_SCORE":
      return `Adjusted score ${action.targetPlayerId} ${action.delta > 0 ? "+" : ""}${action.delta}`;
    case "PASS_PRIORITY":
      return "Passed Priority";
    case "PASS_FOCUS":
      return "Passed Focus";
    case "RESOLVE_CHAIN_TOP":
      return "Resolved Chain top";
    case "SET_BATTLEFIELD_CONTROLLER":
      return `Set ${action.battlefieldId} controller → ${action.controllerId ?? "neutral"}`;
    case "EXHAUST":
      return `Exhaust ${action.cardInstanceId}`;
    case "READY":
      return `Ready ${action.cardInstanceId}`;
    case "CHANNEL":
      return `Channel ${action.count ?? 2}`;
    case "DRAW":
      return `Draw ${action.count ?? 1}`;
    case "ADD_TO_POOL":
      return "Add to Rune Pool";
    case "DEAL_DAMAGE":
      return `Deal ${action.amount} to ${action.targetInstanceId}`;
    case "HEAL":
      return "Heal";
    case "KILL":
      return `Kill ${action.targetInstanceId}`;
    case "PREDICT":
      return `Predict ${action.count ?? 1}`;
    case "STUN":
      return `Stun ${action.targetInstanceId}`;
    case "END_TURN":
    case "ADVANCE_PHASE":
      return "End turn";
    case "MULLIGAN":
      return `Mulligan ${action.cardInstanceIds.length} card(s)`;
    case "OPEN_SHOWDOWN":
      return `Open Showdown ${action.battlefieldId}`;
    case "CLOSE_SHOWDOWN":
      return "Close Showdown";
    case "BEGIN_COMBAT":
      return `Begin Combat ${action.battlefieldId}`;
    case "ADVANCE_COMBAT":
      return "Advance Combat";
    case "CONCEDE":
      return "Concede";
    case "RUN_CLEANUP":
      return "Run Cleanup";
    case "REWIND":
      return "Rewound last action";
    case "SET_ARBITRATION_MODE":
      return `Arbitration mode → ${action.mode}`;
    default: {
      return "Unknown action";
    }
  }
}

export function appendActionLog(
  state: GameState,
  playerId: PlayerId | "system",
  kind: string,
  text: string,
  at = Date.now(),
): GameState {
  logCounter += 1;
  const entry: ActionLogEntry = {
    id: `log_${logCounter}`,
    at,
    playerId,
    kind,
    text,
  };
  return {
    ...state,
    actionLog: [...state.actionLog, entry].slice(-200),
  };
}
