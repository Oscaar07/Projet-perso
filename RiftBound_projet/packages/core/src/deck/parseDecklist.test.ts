import { describe, it, expect } from "vitest";
import { catalogFromArray, parseDecklist, type CardDefinition } from "../index.js";

const CARDS: CardDefinition[] = [
  {
    id: "OGN-001",
    name: "Training Recruit",
    type: "Unit",
    cost: { energy: 1, power: 0 },
    keywords: [],
    tags: [],
    text: "",
  },
  {
    id: "OGN-002",
    name: "Reactive Ward",
    type: "Spell",
    cost: { energy: 1, power: 1 },
    keywords: ["Reaction"],
    tags: ["REACTION"],
    text: "",
  },
  {
    id: "OGN-003",
    name: "Ambush Cache",
    type: "Gear",
    cost: { energy: 0, power: 1 },
    keywords: [],
    tags: [],
    text: "",
  },
  {
    id: "OGN-004",
    name: "Chain Lightning",
    type: "Spell",
    cost: { energy: 2, power: 0 },
    keywords: [],
    tags: [],
    text: "",
  },
];

const catalog = catalogFromArray(CARDS);

describe("parseDecklist", () => {
  it("rejette une liste vide", () => {
    const r = parseDecklist("", catalog, { sandbox: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("parse qty + id", () => {
    const r = parseDecklist(
      `3 OGN-001
2 OGN-002
2 OGN-003
2 OGN-004`,
      catalog,
      { sandbox: true },
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.deck.cardIds).toHaveLength(9);
      expect(r.deck.counts["OGN-001"]).toBe(3);
    }
  });

  it("rejette plus de 3 copies (103.2.b)", () => {
    const r = parseDecklist(
      `4 OGN-001
2 OGN-002
2 OGN-003
2 OGN-004`,
      catalog,
      { sandbox: true },
    );
    expect(r.ok).toBe(false);
  });

  it("rejette carte inconnue", () => {
    const r = parseDecklist(`8 FAKE-001`, catalog, { sandbox: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_CARD");
  });
});
