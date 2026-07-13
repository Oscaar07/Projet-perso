/**
 * Script d'ingestion Riot API → packages/core/data/cards.json
 *
 * Endpoint officiel (Developer Portal) :
 *   GET https://{region}.api.riotgames.com/riftbound/content/v1/contents
 *
 * Le PRD mentionnait `/riftbound/v1/cards` ; l'API publique actuelle est
 * `riftbound-content-v1` (`/riftbound/content/v1/contents`).
 *
 * Usage :
 *   RIOT_API_KEY=xxx npm run ingest
 *
 * Sans clé, le script conserve le seed local (échec soft avec message).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CardDefinition, CardCost } from "../src/types/game.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../data/cards.json");

const REGION = process.env.RIOT_API_REGION ?? "americas";
const LOCALE = process.env.RIOT_LOCALE ?? "en_US";
const API_KEY = process.env.RIOT_API_KEY;

interface RiotMedia {
  type?: string;
  url?: string;
  name?: string;
}

interface RiotCardDTO {
  id?: string;
  cardCode?: string;
  name?: string;
  type?: string;
  cardType?: string;
  energyCost?: number;
  powerCost?: number;
  cost?: number | { energy?: number; power?: number };
  keywords?: string[] | Array<{ name?: string }>;
  tags?: string[];
  description?: string;
  text?: string;
  media?: RiotMedia[];
  [key: string]: unknown;
}

interface RiotContentResponse {
  cards?: RiotCardDTO[];
  data?: RiotCardDTO[];
  [key: string]: unknown;
}

function normalizeKeywords(raw: RiotCardDTO["keywords"]): string[] {
  if (!raw) return [];
  return raw.map((k) => (typeof k === "string" ? k : (k.name ?? ""))).filter(Boolean);
}

function deriveTags(keywords: string[]): string[] {
  return keywords
    .map((k) => k.trim().toUpperCase())
    .filter((k) => k === "REACTION" || k === "ACTION" || k === "RESPOND");
}

function normalizeCost(card: RiotCardDTO): CardCost {
  if (typeof card.cost === "object" && card.cost !== null) {
    return {
      energy: Number(card.cost.energy ?? card.energyCost ?? 0),
      power: Number(card.cost.power ?? card.powerCost ?? 0),
    };
  }
  return {
    energy: Number(card.energyCost ?? card.cost ?? 0),
    power: Number(card.powerCost ?? 0),
  };
}

function mapRiotCard(card: RiotCardDTO): CardDefinition | null {
  const id = card.id ?? card.cardCode;
  const name = card.name;
  if (!id || !name) return null;

  const keywords = normalizeKeywords(card.keywords);
  return {
    id: String(id),
    name: String(name),
    type: String(card.type ?? card.cardType ?? "Unknown"),
    cost: normalizeCost(card),
    keywords,
    tags: [...new Set([...(card.tags ?? []).map((t) => t.toUpperCase()), ...deriveTags(keywords)])],
    text: String(card.text ?? card.description ?? ""),
  };
}

function extractCards(payload: RiotContentResponse): RiotCardDTO[] {
  if (Array.isArray(payload.cards)) return payload.cards;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload as unknown as RiotCardDTO[];
  // Certains payloads nestent sous `contents` / sets
  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      const first = value[0] as Record<string, unknown>;
      if ("name" in first || "cardCode" in first || "id" in first) {
        return value as RiotCardDTO[];
      }
    }
  }
  return [];
}

async function fetchRiotCards(): Promise<CardDefinition[]> {
  if (!API_KEY) {
    throw new Error("RIOT_API_KEY manquante");
  }

  const url = new URL(
    `https://${REGION}.api.riotgames.com/riftbound/content/v1/contents`,
  );
  url.searchParams.set("locale", LOCALE);

  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": API_KEY,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Riot API ${res.status}: ${body.slice(0, 400)}`);
  }

  const payload = (await res.json()) as RiotContentResponse;
  const mapped = extractCards(payload)
    .map(mapRiotCard)
    .filter((c): c is CardDefinition => c !== null);

  if (mapped.length === 0) {
    throw new Error(
      "Réponse Riot sans cartes mappables — vérifier le schéma DTO / locale.",
    );
  }

  return mapped;
}

function writeCards(cards: CardDefinition[]): void {
  writeFileSync(OUT_PATH, `${JSON.stringify(cards, null, 2)}\n`, "utf-8");
  console.log(`Écrit ${cards.length} cartes → ${OUT_PATH}`);
}

async function main(): Promise<void> {
  try {
    const cards = await fetchRiotCards();
    writeCards(cards);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[ingest] Échec Riot API: ${message}`);
    if (existsSync(OUT_PATH)) {
      const existing = JSON.parse(readFileSync(OUT_PATH, "utf-8")) as CardDefinition[];
      console.warn(
        `[ingest] Conservation du seed local (${existing.length} cartes).`,
      );
      process.exitCode = 0;
      return;
    }
    console.error("[ingest] Aucun cards.json de secours.");
    process.exitCode = 1;
  }
}

void main();
