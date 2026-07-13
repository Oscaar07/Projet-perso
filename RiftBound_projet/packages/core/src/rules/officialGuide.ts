/**
 * Déroulement complet d’une partie — Guide How to Play + spec produit.
 * @see docs/GAME_FLOW.md
 */

export const OFFICIAL_GUIDE = {
  mode: "duel" as const,
  victoryScore: 8,
  teamVictoryScore: 11,
  /** Score à partir duquel un Conquer « terrain vide » ne marque plus (draw 1). */
  scoringSoftCap: 7,
  mainDeckSize: 40,
  runeDeckSize: 12,
  maxCopies: 3,
  openingHand: 4,
  mulliganMax: 2,
  maxHandSize: 6,
  channelPerTurn: 2,
  lastPlayerExtraChannelFirstTurn: 1,
  /** Chaque joueur apporte 3 BF ; 1 choisi secrètement → 2 en jeu (duel). */
  battlefieldsPerPlayer: 3,
  battlefieldsInDuel: 2,
  /** Premier joueur : saute la Draw Phase au tour 1. */
  firstPlayerSkipsFirstDraw: true,
} as const;

export const OFFICIAL_GUIDE_URL =
  "https://riftbound.leagueoflegends.com/en-us/news/rules-and-releases/how-to-play-get-started/";

/** Les 6 phases strictes d’un tour. */
export const TURN_PHASES = [
  "awaken",
  "beginning",
  "channel",
  "draw",
  "action",
  "ending",
] as const;

export type TurnPhaseStep = (typeof TURN_PHASES)[number];
