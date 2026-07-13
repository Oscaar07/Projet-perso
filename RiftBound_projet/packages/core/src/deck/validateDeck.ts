import type { CardCatalog } from "../types/factory.js";
import { RulesViolation } from "../engine/errors.js";

export interface DeckConstructionInput {
  mainDeckIds: string[];
  runeDeckIds?: string[];
  legendId?: string;
  championId?: string;
}

export interface DeckViolation {
  code: string;
  message: string;
  ruleRef: string;
}

/**
 * Deck Construction 103 — validation coach.
 */
export function validateDeckConstruction(
  input: DeckConstructionInput,
  catalog: CardCatalog,
  opts?: { enforceOfficialSize?: boolean },
): DeckViolation[] {
  const enforceSize = opts?.enforceOfficialSize ?? false;
  const violations: DeckViolation[] = [];
  const main = input.mainDeckIds;

  if (enforceSize && main.length < 40) {
    violations.push({
      code: "MAIN_TOO_SMALL",
      message: `Main Deck ${main.length} < 40.`,
      ruleRef: "103.2",
    });
  }

  const byName = new Map<string, number>();
  for (const id of main) {
    const def = catalog.get(id);
    if (!def) {
      violations.push({
        code: "UNKNOWN_CARD",
        message: `Carte inconnue ${id}.`,
        ruleRef: "103",
      });
      continue;
    }
    byName.set(def.name, (byName.get(def.name) ?? 0) + 1);
  }
  for (const [name, n] of byName) {
    if (n > 3) {
      violations.push({
        code: "TOO_MANY_COPIES",
        message: `${name}: ${n} copies (max 3).`,
        ruleRef: "103.2.b",
      });
    }
  }

  if (input.runeDeckIds) {
    if (input.runeDeckIds.length !== 12 && enforceSize) {
      violations.push({
        code: "RUNE_DECK_SIZE",
        message: `Rune Deck ${input.runeDeckIds.length} ≠ 12.`,
        ruleRef: "103.3.a",
      });
    }
    for (const id of input.runeDeckIds) {
      const def = catalog.get(id);
      if (def && def.type !== "Rune") {
        violations.push({
          code: "NOT_A_RUNE",
          message: `${id} n'est pas une Rune.`,
          ruleRef: "103.3.a",
        });
      }
    }
  }

  if (input.legendId) {
    const legend = catalog.get(input.legendId);
    if (!legend) {
      violations.push({
        code: "LEGEND_MISSING",
        message: "Champion Legend introuvable.",
        ruleRef: "103.1",
      });
    } else {
      const domains = legend.domains ?? [];
      for (const id of main) {
        const def = catalog.get(id);
        if (!def?.domains?.length || !domains.length) continue;
        if (!def.domains.every((d) => domains.includes(d))) {
          violations.push({
            code: "DOMAIN_IDENTITY",
            message: `${def.name} hors Domain Identity.`,
            ruleRef: "103.1.b",
          });
        }
      }
      if (input.championId) {
        const champ = catalog.get(input.championId);
        if (!champ) {
          violations.push({
            code: "CHAMPION_MISSING",
            message: "Chosen Champion introuvable.",
            ruleRef: "103.2.a",
          });
        } else if (
          legend.championTag &&
          champ.championTag &&
          legend.championTag !== champ.championTag
        ) {
          violations.push({
            code: "CHAMPION_TAG",
            message: "Chosen Champion tag ≠ Legend tag.",
            ruleRef: "103.2.a.2",
          });
        } else if (champ.isChampionUnit === false) {
          violations.push({
            code: "NOT_CHAMPION_UNIT",
            message: "Chosen Champion doit être une Champion Unit.",
            ruleRef: "103.2.a.2",
          });
        }
      }

      let sig = 0;
      for (const id of main) {
        const def = catalog.get(id);
        if (
          def?.signature &&
          legend.championTag &&
          def.championTag === legend.championTag
        ) {
          sig += 1;
        }
      }
      if (sig > 3) {
        violations.push({
          code: "SIGNATURE_LIMIT",
          message: `Signature cards: ${sig} > 3.`,
          ruleRef: "103.2.d",
        });
      }
    }
  }

  return violations;
}

export function assertDeckLegal(
  input: DeckConstructionInput,
  catalog: CardCatalog,
  opts?: { enforceOfficialSize?: boolean },
): void {
  const v = validateDeckConstruction(input, catalog, opts);
  if (v.length) {
    throw new RulesViolation(
      "DECK_ILLEGAL",
      v.map((x) => x.message).join(" ; "),
      v[0]?.ruleRef ?? "103",
    );
  }
}

export const OFFICIAL_MAIN_MIN = 40;
export const OFFICIAL_RUNE_COUNT = 12;
export const OFFICIAL_MAX_COPIES = 3;
