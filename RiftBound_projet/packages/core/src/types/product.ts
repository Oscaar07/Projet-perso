/**
 * Produit privé : sandbox de scrim + moteur d'arbitrage.
 * Base UX = simulateur manuel type Atlas ; différenciateur = Rules Coach (défaut ON).
 *
 * Note politique Riot : l'enforcement auto n'est pas destiné à une app publique
 * avec clé API. Ce dépôt reste privé / entraînement.
 */

export type ArbitrationMode = "manual" | "coach";

/** Zones manipulables façon Atlas (board manuel). */
export type BoardZone =
  | { kind: "hand"; playerId: import("./game.js").PlayerId }
  | { kind: "deck"; playerId: import("./game.js").PlayerId }
  | { kind: "trash"; playerId: import("./game.js").PlayerId }
  | { kind: "base"; playerId: import("./game.js").PlayerId }
  | { kind: "battlefield_units"; battlefieldId: string }
  | { kind: "battlefield_facedown"; battlefieldId: string };

/** Disclaimer Legal Jibber Jabber §6. */
export const RIOT_LEGAL_DISCLAIMER =
  'Riftbound Scrim was created under Riot Games\' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.';

export const UNOFFICIAL_FORMAT_NOTICE =
  "Private unofficial training tool. Rules Coach (automated arbitration) is enabled by default for practice — not an official Riftbound client and not endorsed by Riot.";
