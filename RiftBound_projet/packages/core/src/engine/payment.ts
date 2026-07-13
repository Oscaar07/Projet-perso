import type { CardCost, RunePool } from "../types/game.js";
import { RulesViolation } from "./errors.js";

export interface PaymentResult {
  runes: RunePool;
}

/**
 * Séquence de paiement (étape 4–5) :
 * - Energy → Exhaust (retire du pool disponible, ajoute à exhausted)
 * - Power → Recycle (retire du pool ; retour au deck géré hors de cette fonction pure)
 */
export function canPayCost(runes: RunePool, cost: CardCost): boolean {
  return runes.energy >= cost.energy && runes.power >= cost.power;
}

export function payCost(runes: RunePool, cost: CardCost): PaymentResult {
  if (!canPayCost(runes, cost)) {
    throw new RulesViolation(
      "INSUFFICIENT_RUNES",
      `Runes insuffisantes (besoin Energy ${cost.energy} / Power ${cost.power}, ` +
        `disponible Energy ${runes.energy} / Power ${runes.power}).`,
      "354",
    );
  }

  return {
    runes: {
      energy: runes.energy - cost.energy,
      exhaustedEnergy: runes.exhaustedEnergy + cost.energy,
      power: runes.power - cost.power,
    },
  };
}

/**
 * Pipeline d'activation — Process of Play (règles 351–355) :
 * 1 Remove→Chain  2 Choices/Targets  3 Total Cost  4 Pay  5 Check legality
 *
 * Ressources (159–162, 401, 403) :
 * - Energy : typiquement via Exhaust d'une rune [E] → Add to Rune Pool
 * - Power  : typiquement via Recycle d'une rune → Add domain Power
 * Sandbox : pool numérique simplifié (Exhaust energy / décrémente power).
 */
export type ActivationStep =
  | "DECLARE"
  | "TARGET"
  | "CALC_COST"
  | "CHECK_RUNES"
  | "DEDUCT";

export interface ActivationContext {
  baseCost: CardCost;
  targets: string[];
  step: ActivationStep;
}

export function calculateTotalCost(ctx: ActivationContext): CardCost {
  // Sandbox : pas encore de modificateurs de coût ; hook pour futurs effets.
  void ctx.targets;
  return { ...ctx.baseCost };
}

export function runPaymentPipeline(
  runes: RunePool,
  baseCost: CardCost,
  targets: string[] = [],
): PaymentResult {
  const ctx: ActivationContext = {
    baseCost,
    targets,
    step: "DECLARE",
  };
  ctx.step = "TARGET";
  ctx.step = "CALC_COST";
  const total = calculateTotalCost(ctx);
  ctx.step = "CHECK_RUNES";
  if (!canPayCost(runes, total)) {
    throw new RulesViolation(
      "INSUFFICIENT_RUNES",
      `Runes insuffisantes après calcul du coût total.`,
      "354",
    );
  }
  ctx.step = "DEDUCT";
  return payCost(runes, total);
}
