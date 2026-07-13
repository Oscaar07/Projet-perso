import type { GameError, GameErrorCode } from "../types/game.js";

export class RulesViolation extends Error {
  readonly code: GameErrorCode;
  readonly ruleRef?: string;

  constructor(code: GameErrorCode, message: string, ruleRef?: string) {
    super(message);
    this.name = "RulesViolation";
    this.code = code;
    if (ruleRef !== undefined) {
      this.ruleRef = ruleRef;
    }
  }

  toGameError(): GameError {
    const err: GameError = { code: this.code, message: this.message };
    if (this.ruleRef !== undefined) {
      err.ruleRef = this.ruleRef;
    }
    return err;
  }
}

export function isRulesViolation(error: unknown): error is RulesViolation {
  return error instanceof RulesViolation;
}
