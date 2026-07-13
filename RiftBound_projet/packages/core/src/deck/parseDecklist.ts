import type { CardCatalog } from "../types/factory.js";
import { OFFICIAL_GUIDE } from "../rules/officialGuide.js";

export interface OfficialParsedDeck {
  legendId: string;
  championId: string;
  battlefieldId: string;
  mainDeckIds: string[];
  runeDeckIds: string[];
  /** Main deck including champion (40) before setup split */
  cardIds: string[];
  counts: Record<string, number>;
}

export interface ParsedDeck {
  cardIds: string[];
  counts: Record<string, number>;
  official?: OfficialParsedDeck;
}

export interface DeckParseError {
  code:
    | "EMPTY"
    | "TOO_SMALL"
    | "TOO_LARGE"
    | "UNKNOWN_CARD"
    | "INVALID_LINE"
    | "OFFICIAL_INVALID";
  message: string;
  line?: number;
}

export type DeckParseResult =
  | { ok: true; deck: ParsedDeck }
  | { ok: false; error: DeckParseError };

type Section = "main" | "runes" | "legend" | "champion" | "battlefield" | "auto";

/**
 * Parse decklist.
 * Mode officiel (défaut) — sections Guide How to Play :
 *   #legend OGN-L01
 *   #champion OGN-C01
 *   #battlefield OGN-005
 *   #runes
 *   6 OGN-R01
 *   6 OGN-R02
 *   #main
 *   1 OGN-C01
 *   3 OGN-001
 *   ...
 * Mode sandbox : liste plate (tests) via opts.sandbox.
 */
export function parseDecklist(
  raw: string,
  catalog: CardCatalog,
  opts?: { sandbox?: boolean; min?: number; max?: number },
): DeckParseResult {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) {
    return { ok: false, error: { code: "EMPTY", message: "Decklist vide — import obligatoire." } };
  }

  const sandbox = opts?.sandbox === true;
  if (sandbox || !hasOfficialSections(text)) {
    return parseFlat(text, catalog, opts);
  }
  return parseOfficial(text, catalog);
}

function hasOfficialSections(text: string): boolean {
  return /#\s*(legend|champion|runes|main|battlefield)\b/i.test(text);
}

function parseLineQtyId(line: string): { qty: number; cardId: string } | null {
  const m =
    line.match(/^(\d+)\s*[xX]?\s+([A-Za-z0-9][\w-]*)\b/) ??
    line.match(/^([A-Za-z0-9][\w-]*)\b/);
  if (!m) return null;
  if (m.length >= 3 && m[2]) return { qty: Number(m[1]), cardId: m[2]! };
  return { qty: 1, cardId: m[1]! };
}

function parseFlat(
  text: string,
  catalog: CardCatalog,
  opts?: { min?: number; max?: number },
): DeckParseResult {
  const min = opts?.min ?? 8;
  const max = opts?.max ?? 60;
  const cardIds: string[] = [];
  const counts: Record<string, number> = {};
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]?.trim() ?? "";
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const parsed = parseLineQtyId(line);
    if (!parsed || !Number.isFinite(parsed.qty) || parsed.qty < 1) {
      return {
        ok: false,
        error: { code: "INVALID_LINE", message: `Ligne ${i + 1} invalide: "${line}"`, line: i + 1 },
      };
    }
    if (!catalog.has(parsed.cardId)) {
      return {
        ok: false,
        error: {
          code: "UNKNOWN_CARD",
          message: `Carte inconnue "${parsed.cardId}" (ligne ${i + 1}).`,
          line: i + 1,
        },
      };
    }
    const nextCount = (counts[parsed.cardId] ?? 0) + parsed.qty;
    if (nextCount > OFFICIAL_GUIDE.maxCopies) {
      return {
        ok: false,
        error: {
          code: "INVALID_LINE",
          message: `Trop d'exemplaires de ${parsed.cardId} (max ${OFFICIAL_GUIDE.maxCopies}).`,
          line: i + 1,
        },
      };
    }
    counts[parsed.cardId] = nextCount;
    for (let q = 0; q < parsed.qty; q += 1) cardIds.push(parsed.cardId);
  }

  if (cardIds.length < min) {
    return {
      ok: false,
      error: { code: "TOO_SMALL", message: `Deck trop petit (${cardIds.length}/${min} min).` },
    };
  }
  if (cardIds.length > max) {
    return {
      ok: false,
      error: { code: "TOO_LARGE", message: `Deck trop grand (${cardIds.length}/${max} max).` },
    };
  }
  return { ok: true, deck: { cardIds, counts } };
}

function parseOfficial(text: string, catalog: CardCatalog): DeckParseResult {
  let section: Section = "auto";
  let legendId = "";
  let championId = "";
  let battlefieldId = "";
  const main: string[] = [];
  const runes: string[] = [];
  const counts: Record<string, number> = {};
  const lines = text.split(/\r?\n/);

  const pushCards = (target: string[], cardId: string, qty: number, line: number) => {
    if (!catalog.has(cardId)) {
      throw { code: "UNKNOWN_CARD" as const, message: `Carte inconnue "${cardId}".`, line };
    }
    const next = (counts[cardId] ?? 0) + qty;
    // Legend / battlefield / runes can exceed name-copy rules differently; main uses 3
    if (target === main && next > OFFICIAL_GUIDE.maxCopies) {
      throw {
        code: "OFFICIAL_INVALID" as const,
        message: `Main: max ${OFFICIAL_GUIDE.maxCopies} copies de ${cardId}.`,
        line,
      };
    }
    counts[cardId] = next;
    for (let q = 0; q < qty; q += 1) target.push(cardId);
  };

  try {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]?.trim() ?? "";
      if (!line || line.startsWith("//")) continue;

      const sec = line.match(/^#\s*(legend|champion|battlefield|runes|main)\b(.*)$/i);
      if (sec) {
        section = sec[1]!.toLowerCase() as Section;
        const rest = (sec[2] ?? "").trim();
        if (rest && (section === "legend" || section === "champion" || section === "battlefield")) {
          const p = parseLineQtyId(rest);
          if (p) {
            if (!catalog.has(p.cardId)) {
              return {
                ok: false,
                error: { code: "UNKNOWN_CARD", message: `Carte inconnue "${p.cardId}".`, line: i + 1 },
              };
            }
            if (section === "legend") legendId = p.cardId;
            if (section === "champion") championId = p.cardId;
            if (section === "battlefield") battlefieldId = p.cardId;
          }
        }
        continue;
      }

      const p = parseLineQtyId(line);
      if (!p) {
        return {
          ok: false,
          error: { code: "INVALID_LINE", message: `Ligne ${i + 1} invalide.`, line: i + 1 },
        };
      }

      if (section === "legend") legendId = p.cardId;
      else if (section === "champion") championId = p.cardId;
      else if (section === "battlefield") battlefieldId = p.cardId;
      else if (section === "runes") pushCards(runes, p.cardId, p.qty, i + 1);
      else pushCards(main, p.cardId, p.qty, i + 1);
    }
  } catch (e) {
    const err = e as DeckParseError;
    return { ok: false, error: err };
  }

  if (!legendId || !championId || !battlefieldId) {
    return {
      ok: false,
      error: {
        code: "OFFICIAL_INVALID",
        message: "Guide officiel : #legend, #champion et #battlefield requis.",
      },
    };
  }
  if (runes.length !== OFFICIAL_GUIDE.runeDeckSize) {
    return {
      ok: false,
      error: {
        code: "OFFICIAL_INVALID",
        message: `Rune Deck doit contenir ${OFFICIAL_GUIDE.runeDeckSize} cartes (actuel: ${runes.length}).`,
      },
    };
  }
  // Main includes Chosen Champion → 40
  if (!main.includes(championId)) {
    main.unshift(championId);
  }
  if (main.length !== OFFICIAL_GUIDE.mainDeckSize) {
    return {
      ok: false,
      error: {
        code: "OFFICIAL_INVALID",
        message: `Main Deck doit contenir ${OFFICIAL_GUIDE.mainDeckSize} cartes incl. Chosen Champion (actuel: ${main.length}).`,
      },
    };
  }

  const official: OfficialParsedDeck = {
    legendId,
    championId,
    battlefieldId,
    mainDeckIds: main,
    runeDeckIds: runes,
    cardIds: main,
    counts,
  };
  return { ok: true, deck: { cardIds: main, counts, official } };
}

/** Deck d'entraînement conforme Guide officiel (Duel). */
export const EXAMPLE_DECKLIST = `#legend OGN-L01
#champion OGN-C01
#battlefield OGN-005
#runes
6 OGN-R01
6 OGN-R02
#main
1 OGN-C01
3 OGN-001
2 OGN-002
2 OGN-003
2 OGN-004
3 OGN-U01
3 OGN-U02
3 OGN-U03
3 OGN-U04
3 OGN-U05
3 OGN-U06
3 OGN-U07
3 OGN-U08
3 OGN-U09
3 OGN-U10
`;
