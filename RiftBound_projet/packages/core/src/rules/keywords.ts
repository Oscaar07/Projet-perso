/**
 * Glossaire mots-clés Riftbound — Core Rules 730+ + Guide officiel.
 * Source utilisateur + PDF v1.2.
 *
 * Keywords paramétrés : Assault [X], Deflect [X], Shield [X], Channel [X], Predict [X]
 * (X omis ⇒ 1). Vision = Predict 1.
 */

export type KeywordId =
  | "ACCELERATE"
  | "ACTION"
  | "AMBUSH"
  | "ASSAULT"
  | "BACKLINE"
  | "CHANNEL"
  | "DEATHKNELL"
  | "DEFLECT"
  | "GANKING"
  | "HIDDEN"
  | "LEGION"
  | "PREDICT"
  | "REACTION"
  | "RECYCLE"
  | "SHIELD"
  | "STUN"
  | "TEMPORARY"
  | "VISION"
  | "TANK"
  | "EQUIP"
  | "QUICK-DRAW"
  | "REPEAT"
  | "WEAPONMASTER";

export interface KeywordDef {
  id: KeywordId;
  ruleRef: string;
  /** Accepte une valeur X (Assault 2, Deflect [1], …). */
  parametric?: boolean;
  defaultValue?: number;
  tags: string[];
  summaryFr: string;
  summaryEn: string;
}

export const KEYWORD_GLOSSARY: Record<KeywordId, KeywordDef> = {
  ACCELERATE: {
    id: "ACCELERATE",
    ruleRef: "731",
    tags: ["ACCELERATE"],
    summaryFr:
      "Coût optionnel : payez [1] + 1 Power pour que l'unité entre Ready au lieu d'Exhausted.",
    summaryEn: "Optional cost: pay [1]+1 Power; unit enters ready instead of exhausted.",
  },
  ACTION: {
    id: "ACTION",
    ruleRef: "732",
    tags: ["ACTION"],
    summaryFr:
      "Timing : jouable pendant votre tour (chaîne vide) ou pendant un Showdown.",
    summaryEn: "Timing: playable on your turn or during Showdowns.",
  },
  AMBUSH: {
    id: "AMBUSH",
    ruleRef: "keyword.Ambush",
    tags: ["AMBUSH"],
    summaryFr:
      "Déploiement : jouer l'unité face visible sur un BF où vous avez déjà des troupes.",
    summaryEn: "Play unit face-up to a battlefield where you already have units.",
  },
  ASSAULT: {
    id: "ASSAULT",
    ruleRef: "733",
    parametric: true,
    defaultValue: 1,
    tags: ["ASSAULT"],
    summaryFr: "En tant qu'attaquant, +X Might.",
    summaryEn: "While Attacker, +X Might.",
  },
  BACKLINE: {
    id: "BACKLINE",
    ruleRef: "keyword.Backline",
    tags: ["BACKLINE"],
    summaryFr:
      "Reçoit les dégâts de combat en dernier (après les autres unités de la zone).",
    summaryEn: "Combat damage assigned last among units in the zone.",
  },
  CHANNEL: {
    id: "CHANNEL",
    ruleRef: "417",
    parametric: true,
    defaultValue: 1,
    tags: ["CHANNEL"],
    summaryFr: "Prendre X runes du dessus du Rune Deck sur le plateau.",
    summaryEn: "Put top X runes from Rune Deck onto the board.",
  },
  DEATHKNELL: {
    id: "DEATHKNELL",
    ruleRef: "734",
    tags: ["DEATHKNELL"],
    summaryFr: "Se déclenche quand la carte meurt / est tuée (vers Trash).",
    summaryEn: "Triggers when the permanent dies to Trash.",
  },
  DEFLECT: {
    id: "DEFLECT",
    ruleRef: "735",
    parametric: true,
    defaultValue: 1,
    tags: ["DEFLECT"],
    summaryFr:
      "Sorts/capacités adverses qui me ciblent coûtent +X Power.",
    summaryEn: "Opponent spells/abilities that choose me cost +X Power.",
  },
  GANKING: {
    id: "GANKING",
    ruleRef: "736",
    tags: ["GANKING"],
    summaryFr: "Peut Standard Move BF → BF (sans repasser par la Base).",
    summaryEn: "May Standard Move battlefield to battlefield.",
  },
  HIDDEN: {
    id: "HIDDEN",
    ruleRef: "737",
    tags: ["HIDDEN"],
    summaryFr:
      "Permet Hide face cachée sur un BF contrôlé (coût [A]).",
    summaryEn: "Prerequisite to Hide facedown at a controlled battlefield.",
  },
  LEGION: {
    id: "LEGION",
    ruleRef: "738",
    tags: ["LEGION"],
    summaryFr:
      "Effet si vous avez déjà joué une autre carte Main Deck ce tour.",
    summaryEn: "Condition: you already played another Main Deck card this turn.",
  },
  PREDICT: {
    id: "PREDICT",
    ruleRef: "keyword.Predict",
    parametric: true,
    defaultValue: 1,
    tags: ["PREDICT"],
    summaryFr:
      "Regardez X cartes du dessus du Main Deck ; recyclez-en autant ; reposez le reste.",
    summaryEn: "Look at top X; recycle any; rest back on top.",
  },
  REACTION: {
    id: "REACTION",
    ruleRef: "739",
    tags: ["REACTION"],
    summaryFr:
      "Timing Closed State / réponse — jouable hors tour et pendant la Chain.",
    summaryEn: "Playable in Closed State / as a response (incl. opponent's turn).",
  },
  RECYCLE: {
    id: "RECYCLE",
    ruleRef: "403",
    tags: ["RECYCLE"],
    summaryFr:
      "Placer une carte sous son deck d'origine (coût Power / effet).",
    summaryEn: "Put a card on the bottom of its appropriate deck.",
  },
  SHIELD: {
    id: "SHIELD",
    ruleRef: "740",
    parametric: true,
    defaultValue: 1,
    tags: ["SHIELD"],
    summaryFr: "En tant que défenseur, +X Might.",
    summaryEn: "While Defender, +X Might.",
  },
  STUN: {
    id: "STUN",
    ruleRef: "410",
    tags: ["STUN"],
    summaryFr:
      "Unité étourdie : pas de Might en dégâts de combat (garde Might pour capture).",
    summaryEn: "Stunned: does not contribute Might to combat damage.",
  },
  TEMPORARY: {
    id: "TEMPORARY",
    ruleRef: "742",
    tags: ["TEMPORARY"],
    summaryFr: "Retiré / exilé en fin de tour (ou fin de combat selon l'effet).",
    summaryEn: "Leaves play at end of turn / combat as specified.",
  },
  VISION: {
    id: "VISION",
    ruleRef: "743",
    tags: ["VISION", "PREDICT"],
    summaryFr: "Raccourci : Predict 1.",
    summaryEn: "Shorthand for Predict 1.",
  },
  TANK: {
    id: "TANK",
    ruleRef: "741",
    tags: ["TANK"],
    summaryFr: "Doit recevoir les dégâts de combat avant les non-Tank.",
    summaryEn: "Must be assigned combat damage before non-Tank units.",
  },
  EQUIP: {
    id: "EQUIP",
    ruleRef: "744",
    tags: ["EQUIP"],
    summaryFr: "Mot-clé Equip (attachement).",
    summaryEn: "Equip keyword.",
  },
  "QUICK-DRAW": {
    id: "QUICK-DRAW",
    ruleRef: "745",
    tags: ["QUICK-DRAW"],
    summaryFr: "Mot-clé Quick-Draw.",
    summaryEn: "Quick-Draw keyword.",
  },
  REPEAT: {
    id: "REPEAT",
    ruleRef: "746",
    tags: ["REPEAT"],
    summaryFr: "Mot-clé Repeat.",
    summaryEn: "Repeat keyword.",
  },
  WEAPONMASTER: {
    id: "WEAPONMASTER",
    ruleRef: "747",
    tags: ["WEAPONMASTER"],
    summaryFr: "Mot-clé Weaponmaster.",
    summaryEn: "Weaponmaster keyword.",
  },
};

/** Compat : ancienne map KEYWORD_RULES. */
export const KEYWORD_RULES: Record<
  string,
  { ruleRef: string; tags: string[]; summary: string }
> = Object.fromEntries(
  Object.values(KEYWORD_GLOSSARY).map((k) => [
    k.id,
    { ruleRef: k.ruleRef, tags: k.tags, summary: k.summaryFr },
  ]),
);

const PARAM_RE =
  /^(ACCELERATE|ACTION|AMBUSH|ASSAULT|BACKLINE|CHANNEL|DEATHKNELL|DEFLECT|GANKING|HIDDEN|LEGION|PREDICT|REACTION|RECYCLE|SHIELD|STUN|TEMPORARY|VISION|TANK|EQUIP|QUICK-DRAW|QUICKDRAW|REPEAT|WEAPONMASTER)(?:\s*\[?\s*(\d+)\s*\]?)?$/i;

export interface ParsedKeyword {
  id: KeywordId;
  value: number;
}

/** Parse "Assault 2", "Deflect [1]", "Vision", "Quick-Draw". */
export function parseKeywordToken(raw: string): ParsedKeyword | null {
  const cleaned = raw.trim().replace(/^\[|\]$/g, "");
  const m = cleaned.match(PARAM_RE);
  if (!m) return null;
  let id = m[1]!.toUpperCase().replace("QUICKDRAW", "QUICK-DRAW") as KeywordId;
  if (id === "VISION") {
    return { id: "VISION", value: 1 };
  }
  const def = KEYWORD_GLOSSARY[id];
  if (!def) return null;
  const value =
    m[2] !== undefined
      ? Number(m[2])
      : def.parametric
        ? (def.defaultValue ?? 1)
        : 0;
  return { id, value };
}

export function normalizeKeywords(keywords: string[]): string[] {
  return keywords.map((k) => k.trim().toUpperCase());
}

export function deriveTagsFromKeywords(keywords: string[]): string[] {
  const tags = new Set<string>();
  for (const raw of keywords) {
    const parsed = parseKeywordToken(raw);
    if (parsed) {
      const def = KEYWORD_GLOSSARY[parsed.id];
      for (const t of def.tags) tags.add(t);
      if (parsed.id === "VISION") tags.add("PREDICT");
    } else {
      tags.add(raw.trim().toUpperCase());
    }
  }
  return [...tags];
}

export function hasKeyword(
  keywords: string[],
  tags: string[],
  keyword: string,
): boolean {
  const key = keyword.toUpperCase().replace("QUICKDRAW", "QUICK-DRAW");
  if (normalizeKeywords(tags).includes(key)) return true;
  if (key === "PREDICT" && normalizeKeywords(tags).includes("VISION")) return true;
  for (const raw of keywords) {
    const p = parseKeywordToken(raw);
    if (p) {
      if (p.id === key) return true;
      if (key === "PREDICT" && p.id === "VISION") return true;
    }
    if (raw.trim().toUpperCase() === key) return true;
  }
  return false;
}

/** Somme des valeurs d'un keyword paramétrique (Assault, Shield, Deflect…). */
export function keywordValue(
  keywords: string[],
  tags: string[],
  keyword: KeywordId,
): number {
  let sum = 0;
  let found = false;
  for (const raw of keywords) {
    const p = parseKeywordToken(raw);
    if (!p) continue;
    if (p.id === keyword || (keyword === "PREDICT" && p.id === "VISION")) {
      found = true;
      sum += p.value || KEYWORD_GLOSSARY[keyword].defaultValue || 1;
    }
  }
  if (found) return sum;
  // Fallback tags (sans doublon keywords)
  for (const raw of tags) {
    const p = parseKeywordToken(raw);
    if (!p) continue;
    if (p.id === keyword || (keyword === "PREDICT" && p.id === "VISION")) {
      found = true;
      sum += p.value || KEYWORD_GLOSSARY[keyword].defaultValue || 1;
    }
  }
  if (!found && hasKeyword(keywords, tags, keyword)) {
    return KEYWORD_GLOSSARY[keyword].defaultValue ?? 1;
  }
  return found ? sum : 0;
}

export function isLegionSatisfied(mainDeckCardsPlayedThisTurn: number): boolean {
  // Legion : déjà joué une autre carte Main Deck plus tôt ce tour
  return mainDeckCardsPlayedThisTurn >= 1;
}
