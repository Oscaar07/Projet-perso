import { io, Socket } from "socket.io-client";
import type {
  CardDefinition,
  CardInstance,
  GameError,
  GameState,
  PlayerAction,
  PlayerId,
} from "@riftbound/core";
import catalogJson from "@riftbound/core/data/cards.json";
import "./styles.css";

/** Legal Jibber Jabber §6 — required by Riot policy. */
const RIOT_LEGAL_DISCLAIMER =
  'Riftbound Scrim was created under Riot Games\' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.';

const UNOFFICIAL_FORMAT_NOTICE =
  "Private unofficial training tool. Rules Coach (automated arbitration) is enabled by default for practice — not an official Riftbound client and not endorsed by Riot.";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001";

/** Map moteur → phases A–F (Awaken…End). */
function turnBlockLabel(phase: string): string {
  const labels: Record<string, string> = {
    mulligan: "Setup · Mulligan",
    setup: "Setup",
    awaken: "A · Awaken",
    beginning: "B · Beginning",
    channel: "C · Channel",
    draw: "D · Draw",
    action: "E · Action",
    closed: "E · Action (Closed)",
    ending: "F · End",
    ended: "Ended",
  };
  return labels[phase] ?? phase;
}

const EXAMPLE_DECK = `#legend OGN-L01
#champion OGN-C01
#battlefield OGN-005
#runes
6 OGN-R01
6 OGN-R02
#main
1 OGN-C01
3 OGN-001
2 OGN-002
2 OGN-003
2 OGN-004
3 OGN-U01
3 OGN-U02
3 OGN-U03
3 OGN-U04
3 OGN-U05
3 OGN-U06
3 OGN-U07
3 OGN-U08
3 OGN-U09
3 OGN-U10
`;

type CardMeta = {
  name: string;
  type: string;
  cost: number;
  text: string;
  might?: number;
};

const CARD_META: Record<string, CardMeta> = Object.fromEntries(
  (catalogJson as CardDefinition[]).map((c) => [
    c.id,
    {
      name: c.name,
      type: c.type,
      cost: c.cost?.energy ?? 0,
      text: c.text ?? "",
      ...(c.might != null ? { might: c.might } : {}),
    },
  ]),
);
CARD_META.HIDDEN = {
  name: "Facedown",
  type: "Hidden",
  cost: 0,
  text: "Carte masquée (règle 127).",
};

interface Session {
  code: string;
  playerId: PlayerId;
  state: GameState;
}

type LobbyMode = "create" | "join";
type DropZone =
  | { kind: "battlefield_units"; battlefieldId: string }
  | { kind: "battlefield_facedown"; battlefieldId: string }
  | { kind: "hand"; ownerId: PlayerId }
  | { kind: "base"; ownerId: PlayerId }
  | { kind: "trash"; ownerId: PlayerId };

let socket: Socket | null = null;
let session: Session | null = null;
let selectedCardId: string | null = null;
let lobbyMode: LobbyMode = "create";
let savedDecklist = EXAMPLE_DECK;
let alertTimer: ReturnType<typeof setTimeout> | null = null;
let dragCardId: string | null = null;

function $(sel: string, root: ParentNode = document): HTMLElement {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing ${sel}`);
  return el as HTMLElement;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showAlert(message: string): void {
  let el = document.querySelector(".alert") as HTMLElement | null;
  if (!el) {
    el = document.createElement("div");
    el.className = "alert";
    document.body.appendChild(el);
  }
  el.textContent = message;
  if (alertTimer) clearTimeout(alertTimer);
  alertTimer = setTimeout(() => el?.remove(), 3500);
}

function metaFor(cardId: string): CardMeta {
  return CARD_META[cardId] ?? { name: cardId, type: "Card", cost: 0, text: "" };
}

function renderCard(
  card: CardInstance,
  opts: { selected?: boolean; mini?: boolean; draggable?: boolean } = {},
): string {
  const masked = card.cardId === "HIDDEN";
  const meta = metaFor(masked ? "HIDDEN" : card.cardId);
  const name = masked ? "???" : meta.name;
  const type = masked ? "Hidden" : meta.type;
  const cost = masked ? "?" : String(meta.cost);
  const might =
    !masked && meta.might != null ? `<span class="cmight">${meta.might}</span>` : "";
  const classes = [
    "card",
    opts.mini ? "mini" : "",
    opts.selected ? "selected" : "",
    masked || card.faceDown ? "facedown" : "",
    card.exhausted ? "exhausted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const drag = opts.draggable
    ? `draggable="true" data-drag-card="${escapeHtml(card.instanceId)}"`
    : "";

  return `
    <button class="${classes}" type="button" data-card="${escapeHtml(card.instanceId)}" ${drag} title="${escapeHtml(name)}">
      <span class="cost-pip">${cost}</span>
      <span class="cname">${escapeHtml(name)}</span>
      <span class="ctype">${escapeHtml(type)}</span>
      ${might}
    </button>
  `;
}

function renderHeroSlot(label: string, card: CardInstance | null): string {
  if (!card) {
    return `<div class="hero-slot"><div class="label">${escapeHtml(label)}</div><span class="zone-label">—</span></div>`;
  }
  return `<div class="hero-slot"><div class="label">${escapeHtml(label)}</div>${renderCard(card, { mini: true })}</div>`;
}

function legalFooter(): string {
  return `
    <footer class="legal-footer">
      <p><strong>Unofficial format</strong> — ${escapeHtml(UNOFFICIAL_FORMAT_NOTICE)}</p>
      <p>${escapeHtml(RIOT_LEGAL_DISCLAIMER)}</p>
      <p>
        Policy refs:
        <a href="https://developer.riotgames.com/docs/riftbound" target="_blank" rel="noreferrer">Docs</a>
        ·
        <a href="https://developer.riotgames.com/policies/riftbound" target="_blank" rel="noreferrer">Policies</a>
      </p>
    </footer>`;
}

function ensureSocket(): Socket {
  if (socket) return socket;
  socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

  socket.on("game:state", (payload: { code: string; playerId: PlayerId; state: GameState }) => {
    session = {
      code: payload.code,
      playerId: payload.playerId,
      state: payload.state,
    };
    render();
  });

  socket.on("game:error", (err: GameError) => {
    const ref = err.ruleRef ? ` [${err.ruleRef}]` : "";
    showAlert(`${err.message}${ref}`);
  });

  socket.on("room:ready", () => showAlert("Adversaire connecté — match démarré."));
  socket.on("room:peer_left", () => showAlert("L'adversaire a quitté le salon."));
  socket.on("connect_error", (err) => showAlert(`Connexion serveur impossible: ${err.message}`));

  return socket;
}

function sendAction(action: PlayerAction): void {
  if (!session || !socket) return;
  const full: PlayerAction = { ...action, playerId: session.playerId };
  socket.emit(
    "game:action",
    { action: full },
    (res: { ok: boolean; error?: GameError | string }) => {
      if (!res?.ok && res?.error) {
        const err = res.error;
        if (typeof err === "string") showAlert(err);
        else showAlert(`${err.message}${err.ruleRef ? ` [${err.ruleRef}]` : ""}`);
      }
    },
  );
}

function moveToZone(cardInstanceId: string, to: DropZone): void {
  if (!session) return;
  sendAction({
    type: "MOVE_CARD",
    playerId: session.playerId,
    cardInstanceId,
    to,
  });
  selectedCardId = null;
}

function renderOppBack(count: number): string {
  return Array.from({ length: count }, () => {
    return `<div class="card opp-back facedown"><span class="cname">Riftbound</span><span class="ctype">Hidden</span></div>`;
  }).join("");
}

function scorePips(value: number, side: "p1" | "p2"): string {
  return Array.from({ length: 9 }, (_, i) => {
    const active = i === Math.min(8, Math.max(0, value)) ? ` active ${side}` : "";
    return `<div class="score-pip${active}">${i}</div>`;
  }).join("");
}

function runeControl(
  label: string,
  value: number,
  targetPlayerId: PlayerId,
  field: "energy" | "power" | "exhaustedEnergy",
): string {
  return `
    <div class="rune-line">
      <span>${label}</span>
      <div class="rune-step">
        <button type="button" data-rune="${targetPlayerId}:${field}:-1">−</button>
        <strong>${value}</strong>
        <button type="button" data-rune="${targetPlayerId}:${field}:1">+</button>
      </div>
    </div>`;
}

function bindDropZone(el: Element, zone: DropZone): void {
  el.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    el.classList.add("drag-over");
  });
  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
  el.addEventListener("drop", (ev) => {
    ev.preventDefault();
    el.classList.remove("drag-over");
    const id =
      (ev as DragEvent).dataTransfer?.getData("text/card-id") ||
      dragCardId ||
      selectedCardId;
    if (!id) return;
    moveToZone(id, zone);
    dragCardId = null;
  });
}

function bindCardInteractions(root: ParentNode): void {
  root.querySelectorAll("[data-card]").forEach((btn) => {
    const id = (btn as HTMLElement).dataset.card;
    if (!id) return;

    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      selectedCardId = id;
      render();
    });

    if ((btn as HTMLElement).draggable) {
      btn.addEventListener("dragstart", (ev) => {
        dragCardId = id;
        selectedCardId = id;
        const de = ev as DragEvent;
        de.dataTransfer?.setData("text/card-id", id);
        de.dataTransfer!.effectAllowed = "move";
        (btn as HTMLElement).classList.add("dragging");
      });
      btn.addEventListener("dragend", () => {
        (btn as HTMLElement).classList.remove("dragging");
        dragCardId = null;
      });
    }
  });
}

function renderLobby(): void {
  const app = $("#app");
  app.innerHTML = `
    <section class="lobby">
      <div class="lobby-shell">
        <div class="lobby-brand">
          <span class="eyebrow">Private Scrim Sandbox</span>
          <h1>Riftbound Scrim</h1>
          <p>Import de deck obligatoire · arbitrage actif (privé) · board type Atlas.</p>
        </div>
        <div class="mode-grid">
          <button class="mode-card ${lobbyMode === "create" ? "active" : ""}" type="button" data-mode="create">
            <h2>Private Room</h2>
            <p>Crée un salon et partage le code à 4 caractères.</p>
          </button>
          <button class="mode-card ${lobbyMode === "join" ? "active" : ""}" type="button" data-mode="join">
            <h2>Join Room</h2>
            <p>Entre le code + ta decklist pour démarrer.</p>
          </button>
        </div>
        <div class="lobby-panel">
          <label>Player name
            <input id="name" type="text" maxlength="24" value="Joueur" />
          </label>
          ${
            lobbyMode === "join"
              ? `<label>Room code
                  <input id="code" type="text" maxlength="4" placeholder="X9R2" style="text-transform:uppercase;letter-spacing:0.2em;font-family:var(--font-display);font-size:1.2rem" />
                </label>`
              : ""
          }
          <label>Decklist <span class="req">(obligatoire · min 8)</span>
            <textarea id="decklist" rows="8" spellcheck="false">${escapeHtml(savedDecklist)}</textarea>
          </label>
          <p class="deck-hint">Guide officiel Riot : <code>#legend #champion #battlefield #runes #main</code> (40 + 12). Victoire à 8 points.</p>
          <div class="lobby-actions">
            <button class="btn btn-ghost" id="fill-example" type="button">Example deck</button>
            <button class="btn btn-primary" id="go" type="button">
              ${lobbyMode === "create" ? "Create room" : "Join room"}
            </button>
          </div>
        </div>
        ${legalFooter()}
      </div>
    </section>
  `;

  app.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      savedDecklist = (document.querySelector("#decklist") as HTMLTextAreaElement)?.value ?? savedDecklist;
      lobbyMode = (btn as HTMLElement).dataset.mode === "join" ? "join" : "create";
      render();
    });
  });

  $("#fill-example").addEventListener("click", () => {
    (document.querySelector("#decklist") as HTMLTextAreaElement).value = EXAMPLE_DECK;
  });

  $("#go").addEventListener("click", () => {
    const name = (document.querySelector("#name") as HTMLInputElement).value.trim() || "Player";
    const decklist = (document.querySelector("#decklist") as HTMLTextAreaElement).value;
    savedDecklist = decklist;
    if (!decklist.trim()) {
      showAlert("Import de deck obligatoire pour commencer.");
      return;
    }
    const s = ensureSocket();

    if (lobbyMode === "create") {
      s.emit("room:create", { playerName: name, decklist }, (res: {
        ok: boolean;
        code?: string;
        playerId?: PlayerId;
        state?: GameState;
        error?: string;
      }) => {
        if (!res.ok || !res.code || !res.playerId || !res.state) {
          showAlert(res.error ?? "Création impossible");
          return;
        }
        session = { code: res.code, playerId: res.playerId, state: res.state };
        render();
      });
      return;
    }

    const code = (document.querySelector("#code") as HTMLInputElement).value.trim().toUpperCase();
    if (code.length !== 4) {
      showAlert("Le code doit contenir 4 caractères.");
      return;
    }
    s.emit("room:join", { code, playerName: name, decklist }, (res: {
      ok: boolean;
      code?: string;
      playerId?: PlayerId;
      state?: GameState;
      error?: string;
    }) => {
      if (!res.ok || !res.code || !res.playerId || !res.state) {
        showAlert(res.error ?? "Jonction impossible");
        return;
      }
      session = { code: res.code, playerId: res.playerId, state: res.state };
      render();
    });
  });
}

function renderWaiting(): void {
  if (!session) return;
  const app = $("#app");
  app.innerHTML = `
    <section class="lobby">
      <div class="lobby-shell">
        <div class="lobby-brand">
          <span class="eyebrow">Waiting room</span>
          <h1>Room ${escapeHtml(session.code)}</h1>
          <p>Deck importé. Partage le code — le match démarre quand l'adversaire joint avec sa decklist.</p>
        </div>
        <div class="lobby-panel waiting-panel">
          <div class="wait-code">${escapeHtml(session.code)}</div>
          <p class="deck-hint">En attente du joueur 2…</p>
          <button class="btn btn-danger" id="leave" type="button">Leave</button>
        </div>
        ${legalFooter()}
      </div>
    </section>
  `;
  $("#leave").addEventListener("click", () => {
    socket?.disconnect();
    socket = null;
    session = null;
    render();
  });
}

function renderTable(): void {
  if (!session) return;
  const { state, playerId, code } = session;
  const me = state.players[playerId];
  const oppId: PlayerId = playerId === "player1" ? "player2" : "player1";
  const opp = state.players[oppId];
  const selected =
    me.hand.find((c) => c.instanceId === selectedCardId) ??
    me.base.find((c) => c.instanceId === selectedCardId) ??
    me.trash.find((c) => c.instanceId === selectedCardId) ??
    state.battlefields.flatMap((b) => b.units).find((c) => c.instanceId === selectedCardId) ??
    null;
  const selectedMeta = selected ? metaFor(selected.cardId) : null;

  const logHtml = [...(state.actionLog ?? [])]
    .slice(-40)
    .reverse()
    .map((e) => {
      const t = new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      return `<li><span class="log-t">${escapeHtml(t)}</span> ${escapeHtml(e.text)}</li>`;
    })
    .join("");

  const bfs = state.battlefields
    .map((bf) => {
      const units = bf.units
        .map((u) => renderCard(u, { mini: true, draggable: true, selected: u.instanceId === selectedCardId }))
        .join("");
      const fd = bf.facedown.card;
      const fdLabel = fd
        ? fd.cardId === "HIDDEN"
          ? "Facedown"
          : metaFor(fd.cardId).name
        : "Empty facedown";
      return `
        <div class="bf drop-zone" data-drop="units:${escapeHtml(bf.id)}" data-bf="${escapeHtml(bf.id)}">
          <div class="bf-head">
            <h3>${escapeHtml(bf.id.replace("bf_", "BF "))}</h3>
            <span class="bf-ctrl">${bf.controllerId ?? "neutral"}</span>
          </div>
          <div class="bf-units">${units || ""}</div>
          <div class="facedown-slot drop-zone ${fd ? "filled" : ""}" data-drop="facedown:${escapeHtml(bf.id)}">
            ${escapeHtml(fdLabel)}
          </div>
        </div>`;
    })
    .join("");

  const chainItems =
    state.chain.length === 0
      ? `<p class="chain-empty">The Chain is empty.</p>`
      : `<ol class="chain-list">${[...state.chain]
          .reverse()
          .map(
            (e) =>
              `<li><strong>${escapeHtml(metaFor(e.sourceCardId).name)}</strong> — ${escapeHtml(e.description)}</li>`,
          )
          .join("")}</ol>`;

  const app = $("#app");
  app.innerHTML = `
    <section class="table">
      <aside class="score-rail">
        <span class="name">${escapeHtml(me.name)}</span>
        <span class="score-label">Score ${me.score ?? 0}/8</span>
        ${scorePips(Math.min(8, me.score ?? 0), "p1")}
      </aside>

      <div class="playfield">
        ${state.closedState ? `<div class="phase-banner">Closed state · reactions only</div>` : ""}
        <div class="hand-strip opp">${renderOppBack(opp.hand.length)}</div>

        <div class="zone-row opp-row">
          <div class="pile">DECK<span class="count">${opp.deck.length}</span></div>
          <div class="rune-lane">
            ${
              opp.runeBoard?.length
                ? opp.runeBoard.map((c) => renderCard(c, { mini: true })).join("")
                : `<span class="zone-label">Runes · ${escapeHtml(opp.name)}</span>`
            }
          </div>
          <div class="float-runes">
            <div class="title">Floating · ${escapeHtml(opp.name)}</div>
            ${runeControl("Energy", opp.runes.energy, oppId, "energy")}
            ${runeControl("Power", opp.runes.power, oppId, "power")}
          </div>
        </div>

        <div class="battlefields">${bfs}</div>

        <div class="hero-row">
          ${renderHeroSlot("Legend", me.legendZone)}
          ${renderHeroSlot("Champion", me.championZone)}
        </div>

        <div class="zone-row">
          <div class="pile">DECK<span class="count">${me.deck.length}</span></div>
          <div class="base-lane drop-zone" data-drop="base:${playerId}" id="my-base">
            ${me.base.map((c) => renderCard(c, { mini: true, draggable: true })).join("") || `<span class="zone-label">Base</span>`}
          </div>
          <div class="rune-lane">
            ${
              me.runeBoard?.length
                ? me.runeBoard
                    .map((c) => renderCard(c, { mini: true, draggable: true }))
                    .join("")
                : `<span class="zone-label">Runes (channel)</span>`
            }
          </div>
          <div class="float-runes">
            <div class="title">Floating · you</div>
            ${runeControl("Energy", me.runes.energy, playerId, "energy")}
            ${runeControl("Power", me.runes.power, playerId, "power")}
            ${runeControl("Exhaust", me.runes.exhaustedEnergy, playerId, "exhaustedEnergy")}
          </div>
        </div>

        <div class="zone-row" style="grid-template-columns: 1fr;">
          <div class="base-lane drop-zone" data-drop="trash:${playerId}" id="my-trash">
            ${me.trash.map((c) => renderCard(c, { mini: true, draggable: true })).join("") || `<span class="zone-label">Trash</span>`}
          </div>
        </div>

        <div class="hand-strip drop-zone" id="my-hand" data-drop="hand:${playerId}"></div>
        <div class="hint-bar">Drag cards · Play pour invoquer · drop sur battlefield / base / trash</div>
      </div>

      <aside class="score-rail">
        <span class="name">${escapeHtml(opp.name)}</span>
        <span class="score-label">Score ${opp.score ?? 0}/8</span>
        ${scorePips(Math.min(8, opp.score ?? 0), "p2")}
      </aside>

      <aside class="sidebar">
        <div class="side-head">
          <div class="turn">Turn ${state.turn} · ${escapeHtml(state.players[state.activePlayerId].name)}</div>
          <div class="meta">
            <span>Room <strong>${escapeHtml(code)}</strong></span>
            <span>You <strong>${playerId}</strong></span>
            <span>Phase <strong>${turnBlockLabel(state.phase)}</strong></span>
          </div>
        </div>

        <div class="side-controls">
          <button class="btn-icon" type="button" id="rewind" title="Rewind" ${state.rewindDepth > 0 ? "" : "disabled"}>↶</button>
          <button class="btn-icon" type="button" id="claim" title="Contrôler BF 1">⚑</button>
          <button class="btn btn-ghost" type="button" id="play">Play</button>
          <button class="btn btn-ghost" type="button" id="pass">Pass</button>
          <button class="btn btn-primary" type="button" id="end-turn" ${state.phase === "action" && state.activePlayerId === playerId ? "" : "disabled"}>End Turn</button>
          <button class="btn btn-danger" type="button" id="leave">Leave</button>
        </div>

        ${
          state.phase === "mulligan"
            ? `<div class="mulligan-box">
                <h3>Mulligan (max 2)</h3>
                <p>Sélectionne jusqu'à 2 cartes puis confirme, ou passe.</p>
                <button class="btn btn-primary" type="button" id="mulligan-ok" ${state.mulliganDone?.[playerId] ? "disabled" : ""}>
                  ${state.mulliganDone?.[playerId] ? "En attente adversaire…" : "Confirmer mulligan"}
                </button>
                <button class="btn btn-ghost" type="button" id="mulligan-pass" ${state.mulliganDone?.[playerId] ? "disabled" : ""}>Garder la main</button>
              </div>`
            : ""
        }

        <div class="mode-toggle">
          <span>Play mode</span>
          <button class="btn ${state.arbitrationMode === "coach" ? "btn-primary" : "btn-ghost"}" type="button" id="mode-coach" title="Arbitrage actif — bloque les coups illégaux">
            Rules Coach
          </button>
          <button class="btn ${state.arbitrationMode === "manual" ? "btn-primary" : "btn-ghost"}" type="button" id="mode-manual" title="Plateau libre type Atlas">
            Manual
          </button>
        </div>
        ${
          state.arbitrationMode === "coach"
            ? `<p class="coach-ok">Rules Coach ON — illegal moves are blocked (private training).</p>`
            : `<p class="coach-warn">Manual mode — no automated arbitration.</p>`
        }

        <div class="log-box">
          <h3>Action log</h3>
          <ul class="log-list">${logHtml || "<li>No actions yet.</li>"}</ul>
        </div>

        <div class="chain-box">
          <h3>Chain</h3>
          ${chainItems}
          <button class="btn btn-resolve" type="button" id="resolve" ${state.chain.length === 0 ? "disabled" : ""}>
            Resolve (S)
          </button>
        </div>

        <div class="preview">
          <div class="ph">Card preview</div>
          ${
            selectedMeta && selected
              ? `<h4>${escapeHtml(selectedMeta.name)}</h4>
                 <div class="pt">${escapeHtml(selectedMeta.type)} · cost ${selectedMeta.cost}</div>
                 <p class="ptext">${escapeHtml(selectedMeta.text)}</p>`
              : `<p class="ptext">Sélectionne ou glisse une carte.</p>`
          }
        </div>
      </aside>
    </section>
    ${legalFooter()}
  `;

  const handStrip = $("#my-hand", app);
  handStrip.innerHTML =
    me.hand.length === 0
      ? `<span class="zone-label">Main vide — drop here</span>`
      : me.hand
          .map((c) =>
            renderCard(c, {
              selected: c.instanceId === selectedCardId,
              draggable: true,
            }),
          )
          .join("");

  bindCardInteractions(app);

  app.querySelectorAll("[data-drop]").forEach((el) => {
    const raw = (el as HTMLElement).dataset.drop;
    if (!raw) return;
    const [kind, arg] = raw.split(":");
    if (!kind || !arg) return;
    let zone: DropZone | null = null;
    if (kind === "units") zone = { kind: "battlefield_units", battlefieldId: arg };
    if (kind === "facedown") zone = { kind: "battlefield_facedown", battlefieldId: arg };
    if (kind === "hand") zone = { kind: "hand", ownerId: arg as PlayerId };
    if (kind === "trash") zone = { kind: "trash", ownerId: arg as PlayerId };
    if (kind === "base") zone = { kind: "base", ownerId: arg as PlayerId };
    if (zone) bindDropZone(el, zone);
  });

  // click fallback on facedown / bf
  app.querySelectorAll("[data-bf]").forEach((el) => {
    el.addEventListener("click", () => {
      const bf = (el as HTMLElement).dataset.bf;
      if (!bf || !selectedCardId) return;
      moveToZone(selectedCardId, { kind: "battlefield_units", battlefieldId: bf });
    });
  });

  app.querySelectorAll("[data-rune]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const raw = (btn as HTMLElement).dataset.rune;
      if (!raw) return;
      const [target, field, deltaStr] = raw.split(":");
      const delta = Number(deltaStr);
      if (!target || !field || !Number.isFinite(delta)) return;
      sendAction({
        type: "ADJUST_RUNES",
        playerId,
        targetPlayerId: target as PlayerId,
        ...(field === "energy" ? { energyDelta: delta } : {}),
        ...(field === "power" ? { powerDelta: delta } : {}),
        ...(field === "exhaustedEnergy" ? { exhaustedDelta: delta } : {}),
      });
    });
  });

  $("#rewind").addEventListener("click", () => {
    sendAction({ type: "REWIND", playerId });
  });

  $("#mode-manual").addEventListener("click", () => {
    sendAction({ type: "SET_ARBITRATION_MODE", playerId, mode: "manual" });
  });
  $("#mode-coach").addEventListener("click", () => {
    sendAction({ type: "SET_ARBITRATION_MODE", playerId, mode: "coach" });
  });

  $("#claim").addEventListener("click", () => {
    sendAction({
      type: "SET_BATTLEFIELD_CONTROLLER",
      playerId,
      battlefieldId: "bf_1",
      controllerId: playerId,
    });
  });

  $("#play").addEventListener("click", () => {
    if (!selectedCardId) {
      showAlert("Sélectionne une carte en main.");
      return;
    }
    sendAction({ type: "PLAY_CARD", playerId, cardInstanceId: selectedCardId });
    selectedCardId = null;
  });

  $("#resolve").addEventListener("click", () => {
    sendAction({ type: "RESOLVE_CHAIN_TOP", playerId });
  });

  $("#pass").addEventListener("click", () => {
    sendAction({ type: "PASS_PRIORITY", playerId });
  });

  $("#end-turn")?.addEventListener("click", () => {
    sendAction({ type: "END_TURN", playerId });
  });

  $("#mulligan-ok")?.addEventListener("click", () => {
    const ids = selectedCardId ? [selectedCardId] : [];
    // Collect up to 2 selected — use multi from hand with .selected class
    const selected = [
      ...app.querySelectorAll(".card.selected"),
    ].map((el) => (el as HTMLElement).dataset.id).filter(Boolean) as string[];
    const cardInstanceIds = selected.slice(0, 2);
    sendAction({ type: "MULLIGAN", playerId, cardInstanceIds });
    selectedCardId = null;
  });

  $("#mulligan-pass")?.addEventListener("click", () => {
    sendAction({ type: "MULLIGAN", playerId, cardInstanceIds: [] });
  });

  $("#leave").addEventListener("click", () => {
    socket?.disconnect();
    socket = null;
    session = null;
    selectedCardId = null;
    render();
  });

  window.onkeydown = (ev) => {
    if (!session) return;
    if (ev.key.toLowerCase() === "s" && session.state.chain.length) {
      sendAction({ type: "RESOLVE_CHAIN_TOP", playerId: session.playerId });
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
      ev.preventDefault();
      sendAction({ type: "REWIND", playerId: session.playerId });
    }
  };
}

function render(): void {
  if (!session) {
    renderLobby();
    return;
  }
  if (!session.state.started) {
    renderWaiting();
    return;
  }
  renderTable();
}

render();
