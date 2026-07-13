import { describe, expect, it } from "vitest";
import {
  createInitialGameState,
  resetInstanceCounter,
  type CardInstance,
  type GameState,
  type PlayerId,
} from "../index.js";
import {
  controlsAllBattlefields,
  tryScore,
  maybeConquer,
} from "./scoring.js";
import { enforceHandLimit, runStartOfTurn } from "./turn.js";

function unit(id: string, owner: PlayerId): CardInstance {
  return {
    instanceId: id,
    cardId: "OGN-001",
    ownerId: owner,
    controllerId: owner,
    faceDown: false,
    damage: 0,
    might: null,
    exhausted: false,
    stunned: false,
    buffs: 0,
    isToken: false,
    attachedTo: null,
  };
}

function blankBf(
  id: string,
  controllerId: PlayerId | null,
  units: CardInstance[],
) {
  return {
    id,
    controllerId,
    facedown: { card: null },
    units,
    contested: false,
    contestedBy: null,
    stagedShowdown: false,
    stagedCombat: false,
    attackerId: null,
    defenderId: null,
  };
}

function setup(): GameState {
  resetInstanceCounter(0);
  return createInitialGameState({
    matchId: "score-test",
    player1Deck: ["OGN-001", "OGN-001", "OGN-001", "OGN-001", "OGN-001"],
    player2Deck: ["OGN-001", "OGN-001", "OGN-001", "OGN-001", "OGN-001"],
    start: true,
    officialGuide: false,
    battlefieldIds: ["bf_1", "bf_2"],
  });
}

describe("victory / capture", () => {
  it("Conquer gives +1 when capturing empty battlefield under 7", () => {
    let s = setup();
    s = {
      ...s,
      players: {
        ...s.players,
        player1: { ...s.players.player1, score: 3 },
      },
      battlefields: [
        blankBf("bf_1", null, [unit("u1", "player1")]),
        blankBf("bf_2", "player2", [unit("u2", "player2")]),
      ],
    };
    const next = maybeConquer(s, "bf_1", "player1");
    expect(next.players.player1.score).toBe(4);
    expect(next.battlefields[0]!.controllerId).toBe("player1");
  });

  it("rule of 7: empty conquer at 7 pts → draw 1, no score", () => {
    let s = setup();
    const deckCard = unit("d1", "player1");
    s = {
      ...s,
      players: {
        ...s.players,
        player1: {
          ...s.players.player1,
          score: 7,
          deck: [deckCard],
          hand: [],
        },
      },
      battlefields: [
        blankBf("bf_1", null, [unit("u1", "player1")]),
        blankBf("bf_2", "player2", [unit("u2", "player2")]),
      ],
    };
    const next = maybeConquer(s, "bf_1", "player1");
    expect(next.players.player1.score).toBe(7);
    expect(next.winnerId).toBeNull();
    expect(next.players.player1.hand).toHaveLength(1);
    expect(next.battlefields[0]!.controllerId).toBe("player1");
  });

  it("coup de grâce: Hold at 7 wins without needing all BFs", () => {
    let s = setup();
    s = {
      ...s,
      players: {
        ...s.players,
        player1: { ...s.players.player1, score: 7 },
      },
      battlefields: [
        blankBf("bf_1", "player1", [unit("u1", "player1")]),
        blankBf("bf_2", "player2", [unit("u2", "player2")]),
      ],
    };
    const next = tryScore(s, "player1", "bf_1", "hold");
    expect(next.players.player1.score).toBe(8);
    expect(next.winnerId).toBe("player1");
  });

  it("coup de grâce: conquer all BFs at 7 wins", () => {
    let s = setup();
    s = {
      ...s,
      players: {
        ...s.players,
        player1: { ...s.players.player1, score: 7 },
      },
      battlefields: [
        blankBf("bf_1", null, [unit("u1", "player1")]),
        blankBf("bf_2", "player1", [unit("u2", "player1")]),
      ],
    };
    expect(controlsAllBattlefields(
      {
        ...s,
        battlefields: [
          blankBf("bf_1", "player1", [unit("u1", "player1")]),
          blankBf("bf_2", "player1", [unit("u2", "player1")]),
        ],
      },
      "player1",
    )).toBe(true);
    const next = maybeConquer(s, "bf_1", "player1");
    expect(next.players.player1.score).toBe(8);
    expect(next.winnerId).toBe("player1");
  });

  it("enemy conquer at 7 without all BFs → draw, no win", () => {
    let s = setup();
    const deckCard = unit("d1", "player1");
    s = {
      ...s,
      players: {
        ...s.players,
        player1: {
          ...s.players.player1,
          score: 7,
          deck: [deckCard],
          hand: [],
        },
      },
      battlefields: [
        blankBf("bf_1", "player2", [unit("u1", "player1")]),
        blankBf("bf_2", "player2", [unit("u2", "player2")]),
      ],
    };
    const next = maybeConquer(s, "bf_1", "player1");
    expect(next.players.player1.score).toBe(7);
    expect(next.winnerId).toBeNull();
    expect(next.players.player1.hand).toHaveLength(1);
  });
});

describe("turn structure A–F", () => {
  it("first player skips draw on turn 1", () => {
    let s = setup();
    const drawCard = unit("draw", "player1");
    s = {
      ...s,
      turn: 1,
      firstPlayerId: "player1",
      officialGuide: true,
      players: {
        ...s.players,
        player1: {
          ...s.players.player1,
          deck: [drawCard],
          hand: [],
          runeDeck: [unit("r1", "player1"), unit("r2", "player1")],
        },
      },
    };
    const next = runStartOfTurn(s, "player1");
    expect(next.players.player1.hand).toHaveLength(0);
    expect(next.phase).toBe("action");
  });

  it("non-first turn draws 1", () => {
    let s = setup();
    const drawCard = unit("draw", "player1");
    s = {
      ...s,
      turn: 3,
      firstPlayerId: "player1",
      players: {
        ...s.players,
        player1: {
          ...s.players.player1,
          deck: [drawCard],
          hand: [],
          runeDeck: [],
        },
      },
    };
    const next = runStartOfTurn(s, "player1");
    expect(next.players.player1.hand).toHaveLength(1);
  });

  it("end phase recycles hand above 6", () => {
    let s = setup();
    const cards = Array.from({ length: 8 }, (_, i) => unit(`h${i}`, "player1"));
    s = {
      ...s,
      players: {
        ...s.players,
        player1: {
          ...s.players.player1,
          hand: cards,
          deck: [],
        },
      },
    };
    const next = enforceHandLimit(s, "player1", 6);
    expect(next.players.player1.hand).toHaveLength(6);
    expect(next.players.player1.deck).toHaveLength(2);
  });
});
