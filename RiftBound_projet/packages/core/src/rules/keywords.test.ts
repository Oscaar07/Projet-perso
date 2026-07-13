import { describe, it, expect } from "vitest";
import {
  hasKeyword,
  keywordValue,
  parseKeywordToken,
  deriveTagsFromKeywords,
  isLegionSatisfied,
  KEYWORD_GLOSSARY,
} from "./keywords.js";
import { combatOffenseMight, assignCombatDamage } from "../engine/combatKeywords.js";
import type { CardDefinition, CardInstance } from "../types/game.js";

describe("Keyword glossary", () => {
  it("contient tous les mots-clés du glossaire utilisateur", () => {
    const required = [
      "ACCELERATE",
      "ACTION",
      "AMBUSH",
      "ASSAULT",
      "BACKLINE",
      "CHANNEL",
      "DEATHKNELL",
      "DEFLECT",
      "GANKING",
      "HIDDEN",
      "LEGION",
      "PREDICT",
      "REACTION",
      "RECYCLE",
      "SHIELD",
      "STUN",
      "TEMPORARY",
      "VISION",
    ];
    for (const id of required) {
      expect(KEYWORD_GLOSSARY[id as keyof typeof KEYWORD_GLOSSARY]).toBeDefined();
    }
  });

  it("parse Assault 2 / Deflect [1] / Vision", () => {
    expect(parseKeywordToken("Assault 2")).toEqual({ id: "ASSAULT", value: 2 });
    expect(parseKeywordToken("Deflect [1]")).toEqual({ id: "DEFLECT", value: 1 });
    expect(parseKeywordToken("Vision")).toEqual({ id: "VISION", value: 1 });
  });

  it("Vision implique Predict tag", () => {
    expect(deriveTagsFromKeywords(["Vision"])).toContain("PREDICT");
    expect(keywordValue(["Vision"], [], "PREDICT")).toBe(1);
  });

  it("Legion après une carte Main Deck", () => {
    expect(isLegionSatisfied(0)).toBe(false);
    expect(isLegionSatisfied(1)).toBe(true);
  });
});

describe("Combat keywords", () => {
  const unit = (id: string, extras?: Partial<CardInstance>): CardInstance => ({
    instanceId: id,
    cardId: id,
    ownerId: "player1",
    controllerId: "player1",
    faceDown: false,
    damage: 0,
    might: 3,
    exhausted: false,
    stunned: false,
    buffs: 0,
    isToken: false,
    attachedTo: null,
    ...extras,
  });

  it("Assault ajoute Might en attaque ; Stun met offense à 0", () => {
    const def: CardDefinition = {
      id: "u",
      name: "U",
      type: "Unit",
      cost: { energy: 1, power: 0 },
      keywords: ["Assault 2"],
      tags: ["ASSAULT"],
      text: "",
      might: 3,
    };
    const c = unit("u");
    expect(combatOffenseMight(c, def, "attacker")).toBe(5);
    expect(combatOffenseMight({ ...c, stunned: true }, def, "attacker")).toBe(0);
  });

  it("Tank avant Backline pour assignation", () => {
    const tank = unit("t", { might: 2, controllerId: "player2" });
    const back = unit("b", { might: 5, controllerId: "player2" });
    const catalog = new Map<string, CardDefinition>([
      [
        "t",
        {
          id: "t",
          name: "Tank",
          type: "Unit",
          cost: { energy: 1, power: 0 },
          keywords: ["Tank"],
          tags: ["TANK"],
          text: "",
          might: 2,
        },
      ],
      [
        "b",
        {
          id: "b",
          name: "Back",
          type: "Unit",
          cost: { energy: 1, power: 0 },
          keywords: ["Backline"],
          tags: ["BACKLINE"],
          text: "",
          might: 5,
        },
      ],
    ]);
    const result = assignCombatDamage([back, tank], 2, catalog);
    expect(result.find((u) => u.instanceId === "t")!.damage).toBe(2);
    expect(result.find((u) => u.instanceId === "b")!.damage).toBe(0);
  });

  it("hasKeyword détecte Ganking", () => {
    expect(hasKeyword(["Ganking"], [], "GANKING")).toBe(true);
  });
});
