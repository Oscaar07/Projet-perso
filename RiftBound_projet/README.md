# Riftbound Scrim Sandbox

Outil **privé** d'entraînement : UX type [Rift Atlas](https://play.riftatlas.com) + **Rules Coach (arbitrage) activé par défaut**.

> Dépôt privé — l'arbitrage automatisé est volontairement le cœur du produit pour s'entraîner aux règles.  
> Ne pas publier / ne pas demander de clé API Riot grand public tant que le Coach reste le mode principal.

Riftbound Scrim was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.

## Modèle produit

```
intention (drag, +/−, play, resolve)
  → PlayerAction
  → gameReducer + guards (106.4 / 309 / 326+ / paiement)   ← défaut = coach
  → OK : GameState diffusé (masquage 127)
  → KO : lastError au fautif, plateau inchangé
```

Toggle **Manual** disponible si tu veux un plateau libre sans blocage.

Référence : [Guide officiel How to Play](https://riftbound.leagueoflegends.com/en-us/news/rules-and-releases/how-to-play-get-started/) (Duel) + Core Rules v1.2 — voir [`docs/GAME_FLOW.md`](docs/GAME_FLOW.md) et [`docs/RULES_MAP.md`](docs/RULES_MAP.md).

## Stack

| Package | Rôle |
|---------|------|
| `@riftbound/core` | Moteur isomorphe `gameReducer` + catalogue `cards.json` |
| `@riftbound/server` | Node.js + Socket.io (+ Redis optionnel) |
| `@riftbound/client` | Client web (Vite) piloté par l'état masqué |

## Démarrage rapide

```bash
cd RiftBound_projet
cp .env.example .env
npm install
npm run build:core
npm test
npm run dev
```

- Client : http://localhost:5173  
- Serveur : http://localhost:3001  

### Ingestion Riot API

```bash
RIOT_API_KEY=xxx npm run ingest
```

Sans clé, le seed local `packages/core/data/cards.json` est conservé.

## Objectifs

- **G1** — Arbitrage inviolable (mode coach par défaut)  
- **G2** — Ingestion Riot → `cards.json`  
- **G3** — Salon privé code 4 caractères  

### Règles moteur (coach) — Core Rules v1.2

- **106.4.b / .c / .d** — Facedown max 1, BF contrôlé, perte de contrôle → Trash  
- **309 / 330** — Closed State (Reaction only)  
- **151 / 304** — Timing spell / Turn Player  
- **326–336** — The Chain LIFO  
- **322.7** — Cleanup facedown  
- **351–355** — Paiement (Energy→Exhaust, Power→Recycle simplifié)  
- **127** — Privacy / masquage anti-triche  
- **107.1 / 106.2** — Trash + Base  

Couverture suivie dans `docs/RULES_MAP.md` + `RULE_COVERAGE` (~68 % des blocs majeurs **enforced**, reste partial/stub — surtout Layers + texte libre des cartes / Golden Rule 002).

## Frontend

- Decklist **obligatoire** pour créer / rejoindre  
- Drag-and-drop, Rewind (Ctrl+Z), Action log  
- **Rules Coach ON** par défaut (+ toggle Manual)  
- Disclaimer légal en footer  
