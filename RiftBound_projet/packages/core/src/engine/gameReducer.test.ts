import { describe, it, expect, beforeEach } from "vitest";
import {
  catalogFromArray,
  createInitialGameState,
  gameReducer,
  resetInstanceCounter,
  type CardDefinition,
  type GameState,
  type ReduceContext,
} from "../index.js";

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

const ctx: ReduceContext = { catalog: catalogFromArray(CARDS) };

function setup(): GameState {
  resetInstanceCounter(0);
  let state = createInitialGameState({
    matchId: "test",
    player1Deck: ["OGN-003", "OGN-002", "OGN-004", "OGN-001", "OGN-001"],
    player2Deck: ["OGN-001", "OGN-001", "OGN-001", "OGN-001", "OGN-001"],
    start: true,
    officialGuide: false,
  });
  // Tests d'arbitrage : mode coach (non officiel)
  state = gameReducer(
    state,
    { type: "SET_ARBITRATION_MODE", playerId: "player1", mode: "coach" },
    ctx,
  );
  return gameReducer(
    state,
    {
      type: "SET_BATTLEFIELD_CONTROLLER",
      playerId: "player1",
      battlefieldId: "bf_1",
      controllerId: "player1",
    },
    ctx,
  );
}

describe("Règle 106.4 — Facedown Zone", () => {
  let state: GameState;

  beforeEach(() => {
    state = setup();
  });

  it("106.4.c rejette un facedown sur un Battlefield non contrôlé", () => {
    const card = state.players.player1.hand.find((c) => c.cardId === "OGN-003");
    expect(card).toBeDefined();

    const next = gameReducer(
      state,
      {
        type: "PLAY_FACEDOWN",
        playerId: "player1",
        cardInstanceId: card!.instanceId,
        battlefieldId: "bf_2",
      },
      ctx,
    );

    expect(next.lastError?.code).toBe("FACEDOWN_NOT_CONTROLLER");
    expect(next.lastError?.ruleRef).toBe("106.4.c");
    expect(next.battlefields.find((b) => b.id === "bf_2")?.facedown.card).toBeNull();
    expect(next.players.player1.hand).toHaveLength(state.players.player1.hand.length);
  });

  it("106.4.b rejette un second facedown sur la même zone", () => {
    const first = state.players.player1.hand.find((c) => c.cardId === "OGN-003")!;
    const afterFirst = gameReducer(
      state,
      {
        type: "PLAY_FACEDOWN",
        playerId: "player1",
        cardInstanceId: first.instanceId,
        battlefieldId: "bf_1",
      },
      ctx,
    );
    expect(afterFirst.lastError).toBeNull();
    expect(afterFirst.battlefields.find((b) => b.id === "bf_1")?.facedown.card).not.toBeNull();

    // Remettre une carte en main pour retenter
    const withExtra: GameState = {
      ...afterFirst,
      players: {
        ...afterFirst.players,
        player1: {
          ...afterFirst.players.player1,
          hand: [
            ...afterFirst.players.player1.hand,
            {
              instanceId: "inst_extra",
              cardId: "OGN-003",
              ownerId: "player1",
              faceDown: false,
            },
          ],
        },
      },
    };

    const next = gameReducer(
      withExtra,
      {
        type: "PLAY_FACEDOWN",
        playerId: "player1",
        cardInstanceId: "inst_extra",
        battlefieldId: "bf_1",
      },
      ctx,
    );

    expect(next.lastError?.code).toBe("FACEDOWN_OCCUPIED");
    expect(next.lastError?.ruleRef).toBe("106.4.b");
  });

  it("accepte un facedown légal sur un Battlefield contrôlé vide", () => {
    const card = state.players.player1.hand.find((c) => c.cardId === "OGN-003")!;
    const next = gameReducer(
      state,
      {
        type: "PLAY_FACEDOWN",
        playerId: "player1",
        cardInstanceId: card.instanceId,
        battlefieldId: "bf_1",
      },
      ctx,
    );
    expect(next.lastError).toBeNull();
    const slot = next.battlefields.find((b) => b.id === "bf_1")?.facedown.card;
    expect(slot?.faceDown).toBe(true);
    expect(slot?.cardId).toBe("OGN-003");
  });

  it("106.4.d — perte de contrôle → facedown vers Trash du propriétaire", () => {
    let s = setup();
    const card = s.players.player1.hand.find((c) => c.cardId === "OGN-003")!;
    s = gameReducer(
      s,
      {
        type: "PLAY_FACEDOWN",
        playerId: "player1",
        cardInstanceId: card.instanceId,
        battlefieldId: "bf_1",
      },
      ctx,
    );
    expect(s.battlefields.find((b) => b.id === "bf_1")?.facedown.card).not.toBeNull();

    const next = gameReducer(
      s,
      {
        type: "SET_BATTLEFIELD_CONTROLLER",
        playerId: "player1",
        battlefieldId: "bf_1",
        controllerId: "player2",
      },
      ctx,
    );

    expect(next.lastError).toBeNull();
    expect(next.battlefields.find((b) => b.id === "bf_1")?.facedown.card).toBeNull();
    expect(next.players.player1.trash.some((c) => c.cardId === "OGN-003")).toBe(true);
  });
});

describe("Règles 309 / 326+ — Closed State / The Chain", () => {
  let state: GameState;

  beforeEach(() => {
    state = setup();
  });

  it("passe en closed state dès qu'un effet est empilé", () => {
    const spell = state.players.player1.hand.find((c) => c.cardId === "OGN-004")!;
    const next = gameReducer(
      state,
      {
        type: "PLAY_CARD",
        playerId: "player1",
        cardInstanceId: spell.instanceId,
      },
      ctx,
    );

    expect(next.lastError).toBeNull();
    expect(next.chain.length).toBe(1);
    expect(next.closedState).toBe(true);
    expect(next.phase).toBe("closed");
  });

  it("bloque les actions non-REACTION en closed state", () => {
    const spell = state.players.player1.hand.find((c) => c.cardId === "OGN-004")!;
    const closed = gameReducer(
      state,
      {
        type: "PLAY_CARD",
        playerId: "player1",
        cardInstanceId: spell.instanceId,
      },
      ctx,
    );

    const unit = closed.players.player1.hand.find((c) => c.cardId === "OGN-001");
    // Si pas d'unité en main, en ajouter une
    const ready: GameState = unit
      ? closed
      : {
          ...closed,
          players: {
            ...closed.players,
            player1: {
              ...closed.players.player1,
              hand: [
                ...closed.players.player1.hand,
                {
                  instanceId: "inst_unit",
                  cardId: "OGN-001",
                  ownerId: "player1",
                  faceDown: false,
                },
              ],
            },
          },
        };

    const target =
      ready.players.player1.hand.find((c) => c.cardId === "OGN-001")!;

    const next = gameReducer(
      ready,
      {
        type: "PLAY_CARD",
        playerId: "player1",
        cardInstanceId: target.instanceId,
      },
      ctx,
    );

    expect(next.lastError?.code).toBe("REACTION_REQUIRED");
    expect(next.lastError?.ruleRef).toBe("309.1");
    expect(next.chain.length).toBe(ready.chain.length);
  });

  it("autorise une carte REACTION pendant l'état fermé", () => {
    const spell = state.players.player1.hand.find((c) => c.cardId === "OGN-004")!;
    const closed = gameReducer(
      state,
      {
        type: "PLAY_CARD",
        playerId: "player1",
        cardInstanceId: spell.instanceId,
      },
      ctx,
    );

    const reaction = closed.players.player1.hand.find((c) => c.cardId === "OGN-002");
    const ready: GameState = reaction
      ? closed
      : {
          ...closed,
          players: {
            ...closed.players,
            player1: {
              ...closed.players.player1,
              hand: [
                ...closed.players.player1.hand,
                {
                  instanceId: "inst_react",
                  cardId: "OGN-002",
                  ownerId: "player1",
                  faceDown: false,
                },
              ],
              runes: { energy: 3, exhaustedEnergy: 0, power: 2 },
            },
          },
        };

    const reactCard =
      ready.players.player1.hand.find((c) => c.cardId === "OGN-002")!;

    const next = gameReducer(
      ready,
      {
        type: "PLAY_CARD",
        playerId: "player1",
        cardInstanceId: reactCard.instanceId,
      },
      ctx,
    );

    expect(next.lastError).toBeNull();
    expect(next.chain.length).toBe(ready.chain.length + 1);
    // LIFO : la réaction est au sommet
    expect(next.chain.at(-1)?.sourceCardId).toBe("OGN-002");
  });

  it("résout The Chain en LIFO", () => {
    let s = state;
    const spell = s.players.player1.hand.find((c) => c.cardId === "OGN-004")!;
    s = gameReducer(
      s,
      { type: "PLAY_CARD", playerId: "player1", cardInstanceId: spell.instanceId },
      ctx,
    );

    // Injecter une seconde entrée
    s = {
      ...s,
      chain: [
        ...s.chain,
        {
          id: "chain_forced",
          sourceInstanceId: "x",
          sourceCardId: "OGN-002",
          controllerId: "player2",
          isReaction: true,
          description: "forced",
          pending: false,
          kind: "spell",
        },
      ],
      closedState: true,
      openClosed: "closed",
      phase: "closed",
    };

    expect(s.chain.at(-1)?.id).toBe("chain_forced");

    const after = gameReducer(
      s,
      { type: "RESOLVE_CHAIN_TOP", playerId: "player1" },
      ctx,
    );
    expect(after.chain.at(-1)?.sourceCardId).toBe("OGN-004");
    expect(after.closedState).toBe(true);

    const open = gameReducer(
      after,
      { type: "RESOLVE_CHAIN_TOP", playerId: "player1" },
      ctx,
    );
    expect(open.chain).toHaveLength(0);
    expect(open.closedState).toBe(false);
  });
});

describe("Paiement Rune Pool", () => {
  it("Exhaust Energy et Recycle Power", () => {
    const state = setup();
    const spell = state.players.player1.hand.find((c) => c.cardId === "OGN-002")!;
    const before = state.players.player1.runes;

    const next = gameReducer(
      state,
      {
        type: "PLAY_CARD",
        playerId: "player1",
        cardInstanceId: spell.instanceId,
      },
      ctx,
    );

    expect(next.lastError).toBeNull();
    expect(next.players.player1.runes.energy).toBe(before.energy - 1);
    expect(next.players.player1.runes.exhaustedEnergy).toBe(
      before.exhaustedEnergy + 1,
    );
    expect(next.players.player1.runes.power).toBe(before.power - 1);
  });

  it("rejette un paiement impossible", () => {
    const state = setup();
    const broke: GameState = {
      ...state,
      players: {
        ...state.players,
        player1: {
          ...state.players.player1,
          runes: { energy: 0, exhaustedEnergy: 0, power: 0 },
        },
      },
    };
    const spell = broke.players.player1.hand.find((c) => c.cardId === "OGN-004")!;
    const next = gameReducer(
      broke,
      {
        type: "PLAY_CARD",
        playerId: "player1",
        cardInstanceId: spell.instanceId,
      },
      ctx,
    );
    expect(next.lastError?.code).toBe("INSUFFICIENT_RUNES");
    expect(next.players.player1.hand).toHaveLength(broke.players.player1.hand.length);
  });
});

describe("Atlas manuel + arbitrage", () => {
  it("MOVE_CARD vers facedown applique 106.4.c", () => {
    const state = setup();
    // Retirer le contrôle pour forcer l'erreur
    const uncontrolled = gameReducer(
      state,
      {
        type: "SET_BATTLEFIELD_CONTROLLER",
        playerId: "player1",
        battlefieldId: "bf_1",
        controllerId: null,
      },
      ctx,
    );
    const card = uncontrolled.players.player1.hand.find((c) => c.cardId === "OGN-003")!;
    const next = gameReducer(
      uncontrolled,
      {
        type: "MOVE_CARD",
        playerId: "player1",
        cardInstanceId: card.instanceId,
        to: { kind: "battlefield_facedown", battlefieldId: "bf_1" },
      },
      ctx,
    );
    expect(next.lastError?.code).toBe("FACEDOWN_NOT_CONTROLLER");
  });

  it("ADJUST_RUNES floating +/−", () => {
    const state = setup();
    const next = gameReducer(
      state,
      {
        type: "ADJUST_RUNES",
        playerId: "player1",
        targetPlayerId: "player1",
        energyDelta: 1,
        powerDelta: -1,
      },
      ctx,
    );
    expect(next.lastError).toBeNull();
    expect(next.players.player1.runes.energy).toBe(state.players.player1.runes.energy + 1);
    expect(next.players.player1.runes.power).toBe(state.players.player1.runes.power - 1);
  });

  it("MOVE_CARD vers units fonctionne (Atlas board manuel)", () => {
    const state = setup();
    const card = state.players.player1.hand.find((c) => c.cardId === "OGN-001")!;
    const next = gameReducer(
      state,
      {
        type: "MOVE_CARD",
        playerId: "player1",
        cardInstanceId: card.instanceId,
        to: { kind: "battlefield_units", battlefieldId: "bf_1" },
      },
      ctx,
    );
    expect(next.lastError).toBeNull();
    expect(next.battlefields.find((b) => b.id === "bf_1")?.units.some((u) => u.instanceId === card.instanceId)).toBe(true);
  });
});
