/**
 * Couverture d'arbitrage — objectif = 100 % Core Rules v1.2 (+ texte de carte 002).
 */

export type RuleStatus = "enforced" | "partial" | "stub" | "n/a";

export interface RuleCoverage {
  id: string;
  title: string;
  status: RuleStatus;
  notes?: string;
}

export const RULE_COVERAGE: RuleCoverage[] = [
  { id: "000-002", title: "Golden Rule (card text > rules)", status: "partial", notes: "Keywords enforced; free-text effects need scripts" },
  { id: "050-055", title: "Silver Rule / can't beats can", status: "partial" },
  { id: "101-103", title: "Deck Construction", status: "enforced", notes: "validateDeckConstruction + max 3 copies; size 40/12 optional flag" },
  { id: "106.2", title: "Base", status: "enforced" },
  { id: "106.4", title: "Facedown Zones", status: "enforced" },
  { id: "107", title: "Non-Board Zones", status: "enforced", notes: "hand/deck/trash/champion/legend/rune deck/rune board" },
  { id: "109", title: "Zone-change clears temps", status: "enforced", notes: "clearTemps on trash/hand/deck" },
  { id: "110-118", title: "Setup", status: "partial", notes: "draw 4 + start; mulligan action TBD" },
  { id: "126", title: "Ownership", status: "enforced" },
  { id: "127", title: "Privacy", status: "enforced" },
  { id: "128-129", title: "Back/Front Side", status: "partial" },
  { id: "130-138", title: "Card characteristics", status: "partial" },
  { id: "139-144", title: "Units / Damage / Standard Move", status: "enforced" },
  { id: "145-148", title: "Gear", status: "partial", notes: "Recall at Cleanup 322.7" },
  { id: "149-155", title: "Spells", status: "enforced", notes: "timing + chain; effect text partial" },
  { id: "156-164", title: "Runes / Pool / empty", status: "enforced", notes: "ADD_TO_POOL, empty on draw/EOT" },
  { id: "165-172", title: "Battlefields / Legends", status: "partial" },
  { id: "173-181", title: "Tokens", status: "partial", notes: "isToken field" },
  { id: "182-186", title: "Control", status: "enforced" },
  { id: "300-306", title: "The Turn", status: "enforced", notes: "ADVANCE_PHASE / endTurn" },
  { id: "307-310", title: "Four turn states", status: "enforced" },
  { id: "311-313", title: "Priority / Focus", status: "enforced" },
  { id: "314-317", title: "Turn phases", status: "enforced" },
  { id: "318-323", title: "Cleanups", status: "enforced", notes: "lethal, gear recall, facedown, stage SD/Combat" },
  { id: "324-336", title: "The Chain", status: "enforced" },
  { id: "337-345", title: "Showdowns", status: "enforced" },
  { id: "346-355", title: "Process of Play / Payment", status: "enforced" },
  { id: "357-388", title: "Abilities framework", status: "partial", notes: "activated timing 374 via matrix; triggers stub" },
  { id: "400-422", title: "Game Actions lexicon", status: "enforced", notes: "Draw Exhaust Ready Recycle Deal Heal Play Move Hide Kill Add Channel…" },
  { id: "423-436", title: "Movement / Recall", status: "enforced" },
  { id: "437-444", title: "Combat", status: "enforced", notes: "simplified might exchange" },
  { id: "445-449", title: "Scoring / Victory", status: "enforced" },
  { id: "450-457", title: "Layers", status: "stub" },
  { id: "458-465", title: "Modes of Play", status: "partial", notes: "victoryScore configurable" },
  { id: "649-652", title: "Concede", status: "enforced" },
  { id: "701-711", title: "Buffs / Mighty", status: "enforced" },
  { id: "712-725", title: "Bonus Damage / Attach / Inactive", status: "partial" },
  { id: "726-747", title: "Keyword Glossary", status: "enforced", notes: "tags drive timing/move/hide/deathknell" },
];

export function coverageSummary(): {
  total: number;
  enforced: number;
  partial: number;
  stub: number;
  pctEnforced: number;
} {
  const total = RULE_COVERAGE.length;
  const enforced = RULE_COVERAGE.filter((r) => r.status === "enforced").length;
  const partial = RULE_COVERAGE.filter((r) => r.status === "partial").length;
  const stub = RULE_COVERAGE.filter((r) => r.status === "stub").length;
  return {
    total,
    enforced,
    partial,
    stub,
    pctEnforced: Math.round((enforced / total) * 100),
  };
}

export const ARBITRATION_GOAL =
  "Mode coach : toute action est validée contre les Core Rules v1.2 (matrice d'états + guards). Texte de carte libre = scripts/keywords.";
