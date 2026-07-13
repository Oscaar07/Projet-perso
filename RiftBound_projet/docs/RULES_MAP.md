# Rules map

Spec complète : **[GAME_FLOW.md](./GAME_FLOW.md)** (setup → 6 phases → victoire).

| Domaine | Implémentation |
|---|---|
| Setup + mulligan ≤2 | `createInitialGameState`, `MULLIGAN` |
| Tour A→B→C→D→E→F | `runStartOfTurn` / `endTurn` |
| Channel 2 (+1 P2 T1) | `channelRunes`, `extraChannelUsed` |
| Hold / Conquer / règle des 7 / coup de grâce | `scoring.ts` |
| Main ≤ 6 en End | `enforceHandLimit` |
| Keywords | `docs/KEYWORDS.md` |
| Constantes | `OFFICIAL_GUIDE` |
