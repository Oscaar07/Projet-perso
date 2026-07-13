# Mots-clés Riftbound (arbitrage)

Glossaire moteur : `packages/core/src/rules/keywords.ts` (`KEYWORD_GLOSSARY`).

| Mot-clé | Effet | Enforcement |
|---|---|---|
| **Accelerate** | +1E+1P optionnel → entre Ready | `PLAY_CARD.accelerate` |
| **Action** | Timing Showdown / tour | matrice permissions |
| **Ambush** | Play sur BF avec troupes alliées | `ambushBattlefieldId` |
| **Assault [X]** | +X Might en attaque | combat offense |
| **Backline** | Dégâts de combat en dernier | assignation combat |
| **Channel [X]** | X runes du Rune Deck | `CHANNEL` / phase Channel |
| **Deathknell** | Trigger à la mort | Cleanup → Chain |
| **Deflect [X]** | +X Power si ciblé par adversaire | coût `PLAY_CARD` |
| **Ganking** | Move BF→BF | `STANDARD_MOVE` |
| **Hidden** | Prérequis Hide | action `HIDE` |
| **Legion** | Si déjà joué une carte Main ce tour | `mainDeckCardsPlayedThisTurn` |
| **Predict [X]** | Look / recycle top X | action `PREDICT` |
| **Reaction** | Closed State / réponse | timing |
| **Recycle** | Sous le deck | `ADD_TO_POOL` / mulligan |
| **Shield [X]** | +X Might en défense | combat offense |
| **Stun** | Pas de Might en dégâts combat | offense 0 ; clear EOT |
| **Temporary** | Quitte en fin de tour | `endTurn` |
| **Vision** | = Predict 1 | tags + Predict |
| **Tank** | Dégâts avant non-Tank | assignation combat |

Texte d’effet libre (Deathknell — [Effect], etc.) : nécessite script carte (Golden Rule 002).
