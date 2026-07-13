import type {
  Battlefield,
  CardInstance,
  GameState,
  PlayerId,
  PlayerState,
} from "../types/game.js";

/**
 * Règle 127 — Privacy (masquage réseau).
 */
function maskCard(
  card: CardInstance,
  viewerId: PlayerId,
): CardInstance | { instanceId: string; faceDown: true; hidden: true } {
  if (!card.faceDown) return card;
  if (card.ownerId === viewerId) return card;
  return { instanceId: card.instanceId, faceDown: true, hidden: true };
}

function maskHand(hand: CardInstance[], ownerId: PlayerId, viewerId: PlayerId) {
  if (ownerId === viewerId) return hand;
  return hand.map((c) => ({
    instanceId: c.instanceId,
    faceDown: true as const,
    hidden: true as const,
    ownerId: c.ownerId,
    controllerId: c.controllerId,
    cardId: "HIDDEN",
    damage: 0,
    might: null,
    exhausted: false,
    stunned: false,
    buffs: 0,
    isToken: false,
    attachedTo: null,
  }));
}

function maskPlayer(player: PlayerState, viewerId: PlayerId): PlayerState {
  const hideDeck = (deck: CardInstance[]) =>
    player.id === viewerId
      ? deck
      : deck.map((c) => ({
          ...c,
          cardId: "HIDDEN",
          faceDown: true,
        }));

  return {
    ...player,
    hand: maskHand(player.hand, player.id, viewerId) as CardInstance[],
    deck: hideDeck(player.deck),
    trash: player.trash,
    base: player.base,
    championZone: player.championZone,
    legendZone: player.legendZone,
    runeDeck: hideDeck(player.runeDeck),
    runeBoard: player.runeBoard,
  };
}

function maskBattlefield(bf: Battlefield, viewerId: PlayerId): Battlefield {
  const facedownCard = bf.facedown.card;
  return {
    ...bf,
    facedown: {
      card: facedownCard
        ? (maskCard(facedownCard, viewerId) as CardInstance | null)
        : null,
    },
  };
}

export type PublicGameState = GameState;

export function maskGameStateForPlayer(
  state: GameState,
  viewerId: PlayerId,
): PublicGameState {
  return {
    ...state,
    players: {
      player1: maskPlayer(state.players.player1, viewerId),
      player2: maskPlayer(state.players.player2, viewerId),
    },
    battlefields: state.battlefields.map((bf) => maskBattlefield(bf, viewerId)),
  };
}
