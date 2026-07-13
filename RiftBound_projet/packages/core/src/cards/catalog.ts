import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CardDefinition } from "../types/game.js";
import { catalogFromArray, type CardCatalog } from "../types/factory.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Charge le catalogue local généré par le script d'ingestion. */
export function loadCardCatalog(
  cardsPath = join(__dirname, "../../data/cards.json"),
): CardCatalog {
  const raw = readFileSync(cardsPath, "utf-8");
  const cards = JSON.parse(raw) as CardDefinition[];
  return catalogFromArray(cards);
}

export function loadCardsArray(
  cardsPath = join(__dirname, "../../data/cards.json"),
): CardDefinition[] {
  const raw = readFileSync(cardsPath, "utf-8");
  return JSON.parse(raw) as CardDefinition[];
}
