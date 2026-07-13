import type { CardDefinition, CardInstance, PlayerId } from "../types/game.js";
import { effectiveMight } from "../types/factory.js";
import { hasKeyword, keywordValue } from "../rules/keywords.js";

export type CombatRole = "attacker" | "defender" | null;

/**
 * Might de combat : base + buffs + Assault (attaquant) + Shield (défenseur).
 * Stun : Might combat = 0 pour l'infliger (410.1.b), mais effectiveMight reste pour lethal.
 */
export function combatOffenseMight(
  card: CardInstance,
  def: CardDefinition | undefined,
  role: CombatRole,
): number {
  if (card.stunned) return 0;
  let might = effectiveMight(card, def);
  if (!def) return might;
  if (role === "attacker") {
    might += keywordValue(def.keywords, def.tags, "ASSAULT");
  }
  if (role === "defender") {
    might += keywordValue(def.keywords, def.tags, "SHIELD");
  }
  return might;
}

/**
 * Ordre d'assignation des dégâts (Guide + Tank / Backline) :
 * 1. Tank  2. non-Backline  3. Backline
 * Lethal avant de passer à la suivante.
 */
export function assignCombatDamage(
  units: CardInstance[],
  totalDamage: number,
  catalog: Map<string, CardDefinition>,
): CardInstance[] {
  if (totalDamage <= 0 || units.length === 0) return units;

  const rank = (u: CardInstance): number => {
    const def = catalog.get(u.cardId);
    if (!def) return 1;
    if (hasKeyword(def.keywords, def.tags, "TANK")) return 0;
    if (hasKeyword(def.keywords, def.tags, "BACKLINE")) return 2;
    return 1;
  };

  const order = [...units].sort((a, b) => {
    const d = rank(a) - rank(b);
    if (d !== 0) return d;
    return a.instanceId.localeCompare(b.instanceId);
  });

  const damageMap = new Map<string, number>();
  let remaining = totalDamage;
  for (const u of order) {
    if (remaining <= 0) break;
    const def = catalog.get(u.cardId);
    const might = effectiveMight(u, def);
    const needed = Math.max(0, might - u.damage);
    const deal = Math.min(remaining, needed > 0 ? needed : remaining);
    // Assign at least lethal to current before next (Guide Fight!)
    const assigned = needed > 0 ? Math.min(remaining, needed) : 0;
    // If already lethal-marked, overflow to next — but must fill lethal first
    const add = assigned > 0 ? assigned : deal;
    if (add <= 0 && needed === 0) {
      // already at/over lethal — skip to next for assignment priority
      continue;
    }
    const put = needed > 0 ? Math.min(remaining, needed) : 0;
    if (put > 0) {
      damageMap.set(u.instanceId, (damageMap.get(u.instanceId) ?? 0) + put);
      remaining -= put;
    }
  }
  // leftover damage: dump on last non-backline then backline
  if (remaining > 0) {
    for (const u of [...order].reverse()) {
      if (remaining <= 0) break;
      damageMap.set(u.instanceId, (damageMap.get(u.instanceId) ?? 0) + remaining);
      remaining = 0;
    }
  }

  return units.map((u) => ({
    ...u,
    damage: u.damage + (damageMap.get(u.instanceId) ?? 0),
  }));
}

export function sumCombatOffense(
  units: CardInstance[],
  role: CombatRole,
  controllerId: PlayerId,
  catalog: Map<string, CardDefinition>,
): number {
  return units
    .filter((u) => u.controllerId === controllerId)
    .reduce(
      (s, u) => s + combatOffenseMight(u, catalog.get(u.cardId), role),
      0,
    );
}
