# Déroulement complet d’une partie de Riftbound

Source produit (setup + 6 phases + dénouement). Constantes : `OFFICIAL_GUIDE`.

---

## 1. Préparation (Setup)

| Étape | Règle | Code |
|---|---|---|
| Matériel | 1 Légende, Main 40, Rune 12, 3 BF par joueur | `parseDecklist` / deck validation |
| Placement | Légende + Chosen Champion face visible | `createPlayer` / zones |
| Choix du terrain | 1 BF secret parmi 3 → révélation simultanée → 2 BF en centre | duel : `battlefieldsInDuel: 2` (sélection UI TBD) |
| Main de départ | Mélanger, piocher 4 | `openingHand: 4` |
| Mulligan | ≤2 cartes → Recycle sous le Main Deck | `MULLIGAN`, `mulliganMax: 2` |
| Premier joueur | Au hasard ; joueur 2 : +1 Rune au 1er Channel | `firstPlayerId`, `extraChannelUsed` |

---

## 2. Routine d’un tour (6 phases strictes)

| # | Phase | Actions | Code |
|---|---|---|---|
| **A** | Awaken | Ready unités, équipements, Runes | `readyAll` |
| **B** | Beginning | Hold (+1 / BF contrôlé) ; effets « début de tour » | `scoreHolding` |
| **C** | Channel | 2 runes du Rune Deck (3 pour P2 au 1er tour) | `channelRunes` |
| **D** | Draw | Piocher 1 (P1 saute au tour 1) ; vider réserve d’énergie | `drawCards` + `emptyAllRunePools` |
| **E** | Action | Jouer, déplacer, capacités, Showdown / Conquer | phase `action` |
| **F** | End | Temporary expire ; heal blessures ; main ≤ 6 (recycle) ; passe | `endTurn` |

Implémentation : `runStartOfTurn` (A–E) puis `endTurn` (F → tour suivant A).

### Phase Action (rappel)

- Unités invoquées : Exhaust dans la Base
- Runes : Exhaust → Énergie ; Recycle sous Rune Deck → Pouvoir
- Déplacer une unité Ready Base → BF déclenche Showdown
- Ennemis présents → combat Might ; terrain vide → Capture +1 Conquer

---

## 3. Dénouement

| Règle | Implémentation |
|---|---|
| Premier à **8** (duel) | `victoryScore: 8` |
| **Règle des 7** : à ≥7 pts, Conquer d’un terrain vide → draw 1 | `scoringSoftCap` + `conquerKind: "empty"` |
| **Coup de grâce (8e)** : Hold **OU** contrôle de **tous** les BF | `tryScore` |
| Sinon (point final refusé) | draw 1 à la place |

Équipe : `teamVictoryScore: 11` (même portes pour le dernier point).
