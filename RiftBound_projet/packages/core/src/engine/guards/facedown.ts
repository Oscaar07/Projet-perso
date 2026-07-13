import type { Battlefield, GameState, PlayerId } from "../../types/game.js";
import { RulesViolation } from "../errors.js";

/**
 * Règle 106.4 — Facedown Zone
 * 106.4.b : capacité max = 1 carte
 * 106.4.c : uniquement si le contrôleur de la carte contrôle aussi le Battlefield
 * 106.4.d : perte de contrôle → retrait au prochain Cleanup (322.7 → Trash)
 */
export function assertCanPlaceFacedown(
  state: GameState,
  playerId: PlayerId,
  battlefieldId: string,
): Battlefield {
  const battlefield = state.battlefields.find((bf) => bf.id === battlefieldId);
  if (!battlefield) {
    throw new RulesViolation(
      "INVALID_TARGET",
      `Battlefield "${battlefieldId}" introuvable.`,
      "106.4",
    );
  }

  // 106.4.c — propriété / contrôle
  if (battlefield.controllerId !== playerId) {
    throw new RulesViolation(
      "FACEDOWN_NOT_CONTROLLER",
      `Vous ne contrôlez pas le Battlefield "${battlefieldId}". Impossible d'y placer une carte face cachée.`,
      "106.4.c",
    );
  }

  // 106.4.b — capacité max 1
  if (battlefield.facedown.card !== null) {
    throw new RulesViolation(
      "FACEDOWN_OCCUPIED",
      `La Facedown Zone de "${battlefieldId}" est déjà occupée (max 1 carte).`,
      "106.4.b",
    );
  }

  return battlefield;
}
