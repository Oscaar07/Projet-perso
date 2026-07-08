# FocusTown

> A real-time autonomous city simulation powered by behavioral analytics, productivity systems, and emergent AI.

---

# Overview

FocusTown is an experimental simulation sandbox that combines:

* autonomous AI citizens
* city-building systems
* behavioral psychology
* productivity analytics
* emergent societies
* real-world activity tracking
* real-time simulation
* desktop productivity monitoring

The long-term vision is to create:

> a living virtual civilization that evolves based on both simulated and real-world human behavior.

---

# Core Concept

FocusTown explores the idea of:

> "a city that reflects human focus and productivity."

The project merges two major systems:

---

# 1. Autonomous City Simulation

A fully simulated city populated by autonomous AI citizens.

Each citizen:

* works
* sleeps
* eats
* socializes
* develops habits
* forms relationships
* experiences stress
* procrastinates
* follows routines
* reacts emotionally
* makes decisions independently

The city evolves through emergent systems:
simple individual rules creating large-scale complex behaviors.

---

# 2. Productivity & Behavioral Tracker

A desktop productivity tracker capable of detecting:

* distractions
* alt-tab frequency
* idle time
* multitasking
* doomscrolling
* focus sessions
* deep work
* burnout patterns
* behavioral trends

The tracker synchronizes real-world productivity data directly into the simulation.

---

# The Twist

Your real-world behavior affects the city.

Examples:

| Real Behavior     | Simulation Effect        |
| ----------------- | ------------------------ |
| Deep work session | Economy improves         |
| Focused work      | Citizen morale increases |
| Procrastination   | Stress spreads           |
| Doomscrolling     | Burnout rises            |
| Healthy routines  | Society stabilizes       |
| Multitasking      | Productivity decreases   |

The city becomes a behavioral mirror of the user.

---

# Philosophy

FocusTown is not just a game prototype.

It is an experimental simulation platform focused on:

* emergent behavior
* autonomous systems
* behavioral psychology
* human productivity modeling
* digital societies
* scalable simulation architecture

The project aims to evolve progressively from a simple simulation into a living autonomous world driven by both simulated and real-world behavior.

---

# Current Features

# Simulation Engine

## Core Architecture

* real-time simulation loop (fixed-timestep accumulator at 10 ticks/sec)
* modular system architecture (20+ systems + utilities, dependency-ordered)
* dirty-flag system (tiles/buildings update only on mutation)
* autonomous entities
* productivity impact tracking per tick

---

# Citizens

Each citizen contains:

## Basic Needs

* hunger
* energy
* mood
* hygiene
* fun
* money
* health

---

## Personality Traits

* diligence
* sociability
* laziness
* discipline
* confidence
* anxiety
* perfectionism

---

## Psychological Systems

* stress
* burnout
* procrastination
* motivation
* emotional states (happy, neutral, sad, anxious, burnout)
* behavioral routines

---

## Social Systems

* friendships
* relationship persistence
* emotional contagion
* social decay

---

## Movement System

Citizens move on a discrete grid with Pokémon-style lock:

* `facingDirection` — down/up/left/right (updated each tick by MovementSystem)
* `movingTicks` — decremented each tick; citizen skips AI action while moving
* Rendering interpolates between grid positions via `tickProgress` (0..1) for smooth visual movement

---

## Dynamic Locations

Each citizen has:

* home
* workplace
* restaurant targets
* dynamic movement targets

---

# AI Systems

# Utility AI

Citizens dynamically choose actions based on:

* needs
* personality
* memories
* emotions
* schedules
* routines
* habits

Current actions:

* work
* sleep
* eat
* socialize
* relax
* wander

---

# Habit System

Citizens progressively build long-term routines.

Examples:

* workaholics
* procrastinators
* highly social citizens
* lazy citizens

Repeated actions influence future behavior.

---

# Memory System

Citizens remember:

* positive experiences
* stressful events
* work experiences
* social interactions

Memories directly influence future decisions.

---

# Emotion System

Citizens can experience:

* happiness
* sadness
* anxiety
* burnout
* stress

Emotions influence:

* productivity
* movement
* socialization
* routines
* decision-making

---

# Social Simulation

Citizens:

* form friendships
* influence each other emotionally
* spread stress socially
* become isolated
* develop social groups

---

# World Simulation

# Tile-Based World

The world is:

* procedurally generated (30x30 grid)
* scalable
* grid-based

Current tiles:

* grass
* roads

---

# Buildings

Current building types:

* houses
* offices
* restaurants
* roads

Buildings support:

* capacity
* comfort
* cleanliness

---

# Economy Simulation

Current systems:

* 5 job types (developer, artist, engineer, merchant, scientist) with unique salary/energy tradeoffs
* salaries
* taxes
* money circulation
* restaurant spending
* city budget
* maintenance costs
* building upkeep

---

# Population Simulation

Includes:

* automatic population growth
* residential demand simulation
* housing systems
* population caps
* happiness multiplier on growth

---

# Zoning

Current zoning types:

* residential
* commercial

Zones can automatically generate buildings over time.

---

# Construction

* place buildings (house, office, restaurant)
* build roads with drag-to-place
* place residential/commercial zones
* cost validation
* ghost preview with canBuild validation

---

# Weather & Time

Includes:

* day/night cycle with visual tinting (night=dark blue, evening=orange, morning=yellow)
* weather simulation
* chronotypes (morning/night)
* schedules

Weather states:

* sunny
* rain
* fog
* storm

---

# Rendering

The project uses:

# PixiJS (v8)

for:

* high-performance rendering (WebGPU/WebGL)
* scalable 2D graphics
* real-time simulation visualization

Current rendering features:

* stateless dirty-flag architecture (tiles/buildings redrawn only on change)
* 4-layer rendering pipeline (grid, tiles, buildings, entities)
* tile rendering with filling
* citizen rendering (colored circles with emotion-based coloring, smooth movement interpolation via tickProgress)
* building rendering (houses with roof triangles, offices with roof rectangles, restaurants with roof + dot)
* camera movement (arrow keys)
* zoom system (mouse wheel, 0.5x-3x)
* time-of-day and weather visual overlays
* hover tile highlighting
* build ghost preview with validation

---

# UI

The interface is built with:

# React (v19)

Current UI systems:

* citizen inspector (all stats, needs, emotions, personality, habits, best friend, debug action scores)
* building inspector (type, capacity, stats)
* build mode selector (6 modes + cancel)
* analytics HUD (population, money, demand, productivity impact per tick with deltas)
* simulation statistics with procrastination, burnout, and debug scores
* productivity dashboard with Recharts stacked bar chart and event journal
* focus streak tracking
* simulation speed controls (0.5x, 1x, 2x, 4x)
* pause/play toggle
* simulation save/load with named saves (list, load, delete)
* classifier settings modal (focus/distraction domains, poll interval, idle timeout)
* extension connection status indicator (green/red dot)
* error boundary with reload fallback

---

# Desktop App

The desktop app is built with:

# Tauri (v2)

* Rust backend for system-level access
* Windows API active window detection
* Idle detection via GetLastInputInfo
* Granular keyboard/mouse activity tracking via `rdev` crate
* App/site classification (focus/distraction/idle/unknown)
* Configurable classifier with user-editable focus/distraction rules
* WebSocket server (`ws://127.0.0.1:9736`) for browser extension integration
* SQLite database for productivity event persistence

---

# Productivity Simulation

FocusTown already simulates:

* procrastination
* burnout
* stress accumulation
* motivation
* routines
* productivity scoring

This forms the foundation for future real-world productivity integration.

---

# Productivity Bridge

A dedicated system (`ProductivityInfluenceSystem`) maps real-world focus/distraction ratios into the simulation:

| Real Behavior    | Simulation Effect                          |
| ---------------- | ------------------------------------------ |
| Focus session    | Citizen mood ↑, stress ↓, motivation ↑ |
| Distraction      | Citizen stress ↑, burnout ↑, city money ↓ |
| Idle             | City money ↓                            |
| Break            | Slight positive effect                  |

---

# Architecture

FocusTown follows a modular architecture inspired by:

* simulation engines
* city builders
* game engines
* modular system architecture

---

# Folder Structure

```txt
src/
├── simulation/            # Simulation engine, systems, entities
│   ├── ai/                # Utility AI, scoring, memory
│   ├── engine/            # Tick loop, system orchestration
│   ├── entities/          # Citizens (with movingTicks, facingDirection), buildings
│   ├── systems/           # 20+ independent simulation systems
│   ├── world/             # World generation, weather, zoning
│   ├── config/            # Global constants
│   ├── SimulationSerializer.ts  # Simulation save/load serialization
│   └── SimulationStorage.ts     # Simulation persistence layer
│
├── rendering/             # PixiJS visual layer
│   ├── scenes/            # CityScene — tile, citizen (circles), building rendering
│
├── store/                 # Zustand stores (simulation, UI, productivity)
├── productivity/          # Types, summaries, analytics, daily reports, storage
├── tracking/              # React hook for Tauri active window tracking
├── ui/                    # React components (HUD, dashboard, classifier settings modal)
├── app/                   # Application entry point (App.tsx)
├── database/              # (empty — future migrations)
├── components/            # (empty — future shared components)
├── hooks/                 # (empty — future custom hooks)
├── services/              # (empty — future service layer)
├── types/                 # (empty — future shared types)
├── utils/                 # (empty — future utilities)
├── pages/                 # (empty — future routing)
└── styles/                # (empty — future global styles)

src-tauri/
└── src/
    ├── commands/       # Tauri IPC commands: tracking, events, reports, simulation save/load, classifier config, extension status
    │   ├── mod.rs
    │   ├── tracking.rs
    │   ├── reports.rs
    │   ├── simulation.rs
    │   └── config.rs   # get_classifier_config, set_classifier_config, get_extension_status
    ├── tracking/       # Windows API active window detection + idle detection + classification + input tracking
    │   ├── tracker.rs
    │   ├── classifier.rs   # ClassifierConfig, classify() with configurable domains
    │   └── input.rs        # Global keyboard/mouse listener via rdev
    ├── network/        # WebSocket server for browser extension
    │   └── mod.rs      # ws://127.0.0.1:9736 — receives URL events, forwards to Tauri
    ├── database/       # SQLite connection, schema, models, queries
    │   ├── db.rs       # Includes app_config table init, load_classifier_config()
    │   ├── models.rs
    │   └── queries.rs
    ├── lib.rs          # Tauri app builder (WS server, input listener, config loading)
    └── main.rs         # Windows entry point
```

---

# Directory Responsibilities

## simulation/

Contains all simulation logic.

### ai/

Decision-making systems.

Examples:

* UtilityAI
* behavior scoring
* action evaluation

---

### engine/

Core simulation orchestration.

Responsible for:

* fixed-timestep accumulator (100ms ticks)
* system execution with dependency ordering
* world updates
* 1-second catch-up cap to prevent spiral-of-death

---

### entities/

Simulation entities.

Examples:

* citizens
* buildings

---

### systems/

20 independent simulation systems executed in order each tick:

1. TimeSystem — day/night cycle, weather progression
2. ScheduleSystem — chronotype-based work/sleep schedules
3. ActionTargetSystem — UtilityAI → target assignment
4. PathfindingSystem — A* with traffic-aware routing
5. MovementSystem — path following with occupancy tracking
6. LocationEffectSystem — home/restaurant effects
7. NeedsSystem — hunger, energy, mood, hygiene, fun, stress decay
8. EmotionSystem — emotional state machine
9. MemorySystem — memory creation + pruning
10. HabitSystem — habit reinforcement/decay
11. ProcrastinationSystem — procrastination/burnout mechanics
12. HealthSystem — health/sickness
13. HousingSystem — home comfort/cleanliness effects
14. JobSystem — per-job salary and energy/mood effects
15. EconomySystem — money, spending, salaries
16. SocialSystem — friendships, emotional contagion, social decay
17. PopulationSystem — spawning, housing demand, growth
18. CityFinanceSystem — taxes, building upkeep, bankruptcy
19. ConstructionSystem — build, road, zone, auto-build
20. ProductivityInfluenceSystem — real productivity → simulation bridge
21. PathfindingGrid — traffic grid utility for pathfinding

---

### world/

World generation and environmental logic.

Examples:

* map generation
* zoning
* weather
* tiles

---

### config/

Global constants and configuration (world dimensions, tick rate, etc.).

---

# Tick Lifecycle

The simulation uses a deterministic tick-based architecture with a fixed-timestep accumulator.

Each tick updates the entire world state.

---

# Tick Flow

```txt
Simulation Tick
│
├── update time
├── update weather
├── update schedules
├── update AI decisions
├── update pathfinding
├── update movement
├── update location effects
├── update needs
├── update emotions
├── update memories
├── update habits
├── update procrastination
├── update health
├── update housing
├── update jobs
├── update economy
├── update social systems
├── update population
├── update city finance
├── update construction / zoning
├── update productivity influence
└── render frame
```

---

# Simulation Philosophy

FocusTown prioritizes:

* emergence
* modularity
* scalability
* deterministic logic
* autonomous behaviors

The goal is to create large-scale believable behavior from simple local interactions.

---

# Systems Documentation

# UtilityAI

Responsible for selecting the best action for a citizen.

Inputs:

* needs
* emotions
* memories
* routines
* personality
* stress

Outputs:

* work
* sleep
* eat
* socialize
* relax
* wander

---

# ActionTargetSystem

Bridges UtilityAI scoring into actual movement target assignment.
Clears existing paths when a new action is chosen.
Skips citizens with `movingTicks > 0` (Pokémon-style action lock during movement).

---

# MovementSystem

Handles:

* movement
* path following
* navigation execution
* per-tile occupancy tracking
* Sets `facingDirection` (down/up/left/right) each tick
* Increments `movingTicks` while moving — AI actions are locked during movement

---

# PathfindingSystem

Current:

* A* pathfinding with Manhattan heuristic
* traffic-aware routing via occupancy-based penalty system
* pathfinding iteration cap to prevent hangs

---

# NeedsSystem

Updates:

* hunger
* energy
* mood
* hygiene
* stress

---

# EconomySystem

Handles:

* salaries (5 job types with different rates)
* taxes
* spending (restaurant costs)
* money circulation
* city budget management

---

# SocialSystem

Handles:

* friendships
* emotional contagion (stress, burnout spread)
* social decay
* interactions

---

# MemorySystem

Stores:

* emotional memories
* positive experiences
* negative experiences
* work stress

Memories influence future decisions.

---

# ScheduleSystem

Controls:

* work schedules
* sleep routines
* chronotypes (morning lark / night owl)
* productivity windows

---

# PopulationSystem

Handles:

* spawning
* housing availability
* population growth
* demand simulation (residential demand driven by unemployment + happiness)

---

# HabitSystem

Controls:

* habit reinforcement (repeated actions strengthen habits)
* habit decay (inactivity weakens habits)
* habit-influenced action scoring

---

# ProcrastinationSystem

Controls:

* procrastination build-up from low motivation
* burnout accumulation from overwork
* burnout recovery during relaxation

---

# ProductivityInfluenceSystem

Bridges real-world productivity data into the simulation.

Affects:

* citizen mood
* stress
* burnout
* motivation
* city money

---

# TimeSystem

Controls:

* time-of-day progression
* day/night cycle with phase tracking
* weather state changes

---

# ConstructionSystem

Controls:

* building placement (6 types + road)
* road drag-to-place
* zone placement (residential, commercial)
* auto-building from zones (0.1% chance per tick)
* cost validation

---

# CityFinanceSystem

Controls:

* tax collection from employed citizens
* building upkeep costs
* bankruptcy detection (cityMoney < -1000)

---

# Rendering Pipeline

Rendering is separated from simulation logic.

Simulation:

* updates state

Rendering:

* visualizes state only

Movement interpolation uses `tickProgress` (0..1) for smooth grid-to-grid transitions.
Sprite loading pipeline is planned but not yet implemented.

Benefits:

* maintainability
* scalability
* debugging
* optimization

---

# Technologies

## Frontend

* React 19 + Zustand 5 (state management)
* TypeScript 5.8
* PixiJS v8 (WebGPU/WebGL rendering)
* Recharts 3 (productivity charts)
* Vite 7
* Tailwind CSS 4 (available, not yet integrated)

## Desktop

* Tauri v2 (Rust backend)
* Windows API (active window detection via `windows` crate)
* rusqlite (SQLite persistence)
* serde (serialization)
* tokio + tokio-tungstenite (WebSocket server for browser extension)
* rdev (global keyboard/mouse input listener)

---

## Database

Current:

* SQLite via rusqlite (`focustown.db`)
* `productivity_events` table with full CRUD
* `simulation_saves` table with named save data
* `app_config` table for classifier config persistence (key-value)
* IPC commands for save/query/daily reports
* IPC commands for simulation save/load/list/delete
* IPC commands for classifier config get/set and extension status

Planned:

* PostgreSQL (optional cloud sync)

---

# Installation

# Requirements

* Node.js 18+
* npm or pnpm
* Git
* Rust toolchain (for desktop build)

---

# Setup

Clone the repository:

```bash
git clone https://github.com/yourusername/focustown.git
```

Enter the project:

```bash
cd focustown
```

Install dependencies:

```bash
npm install
```

Start development server (browser-only):

```bash
npm run dev
```

---

# Build

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# Desktop Build

```bash
npm run tauri dev
```

---

# Contribution Guide

# General Rules

* keep systems modular
* avoid giant files
* one responsibility per system
* avoid tightly coupled systems
* avoid direct cross-system dependencies

---

# Code Philosophy

Preferred:

```txt
SimulationEngine
  -> Systems
    -> Entities
```

Avoid:

```txt
System A directly controlling System B
```

---

# Development Principles

FocusTown is designed around:

## Emergence

Complex systems should emerge naturally from:

* local interactions
* simple rules
* feedback loops

---

## Scalability

Systems should eventually support:

* thousands of citizens
* large maps
* multiplayer possibilities

---

## Determinism

Simulation behavior should remain:

* reproducible
* debuggable
* predictable

---

# Current Limitations

Current prototype limitations:

* no ECS implementation yet (traditional OOP with modular systems)
* limited optimization for 1000+ citizens
* browser extension exists but needs manual installation — not yet distributed
* no sprite loading pipeline (SpriteLoader not implemented)
* citizen rendering uses colored circles (no sprites yet)
* no sound
* test suite: 211 tests across 26 files covering all 15 simulation systems
* no cloud sync or cross-device support

---

# Immediate TODOs

# Simulation — Backend

* citizen lifecycle (aging → death, emigration, replacement cycle)
* education & career specialization system
* events & crises (natural disasters, epidemics, recessions)
* infrastructure basics (electricity, water, garbage)
* crime & policing system
* performance optimization for 1000+ citizens

---

# Simulation — AI

* improve routines
* improve emotional simulation
* add addictions
* add long-term goals
* improve social groups

---

# Rendering

* add animations
* improve sprites
* optimize rendering

---

# Productivity Tracker

* [x] create Tauri app
* [x] detect active windows (Rust polling every 5s)
* [x] detect idle time (GetLastInputInfo, 100s timeout)
* [x] build analytics dashboard
* [x] SQLite database for event persistence
* [x] track browser websites (via WebSocket server + browser extension)
* [x] full keyboard/mouse activity tracking (rdev global listener)
* [x] configurable classifier (focus/distraction domains, poll interval, idle timeout)
* [x] extension connection status indicator
* [ ] browser extension distribution / auto-install

---

# Performance Goals

Long-term targets:

* 1000+ active citizens
* large maps
* stable real-time simulation
* scalable AI systems
* optimized CPU usage

---

# Planned Save System

Future saves should persist:

* city state
* citizens
* memories
* relationships
* economy
* analytics
* productivity data

---

# Inspiration

Inspired by:

* The Sims 4
* RimWorld
* Cities: Skylines
* Dwarf Fortress
* Factorio
* SimCity 4

---

# Roadmap

## Phase 0 — Implemented (current)

- [x] Create Tauri application — [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json#L1)
- [x] Setup React frontend — [src/app/App.tsx](src/app/App.tsx#L1)
- [x] Pixi rendering (tile/citizen/building rendering) — [src/rendering/scenes/CityScene.ts](src/rendering/scenes/CityScene.ts#L1)
- [x] HUD / Statistics panels (population, money, demand) — [src/ui/HUD.tsx](src/ui/HUD.tsx#L1)
- [x] A* pathfinding with traffic-aware routing — [src/simulation/systems/PathfindingSystem.ts](src/simulation/systems/PathfindingSystem.ts#L1)
- [x] Procrastination system & burnout mechanics — [src/simulation/systems/ProcrastinationSystem.ts](src/simulation/systems/ProcrastinationSystem.ts#L1), [src/simulation/systems/EmotionSystem.ts](src/simulation/systems/EmotionSystem.ts#L1)
- [x] Memory system (short-term memories affecting choices) — [src/simulation/systems/MemorySystem.ts](src/simulation/systems/MemorySystem.ts#L1)
- [x] Utility AI action scoring — [src/simulation/ai/UtilityAI.ts](src/simulation/ai/UtilityAI.ts#L1)
- [x] Day/night & weather overlays (lighting) — [src/rendering/scenes/CityScene.ts](src/rendering/scenes/CityScene.ts#L200)
- [x] SQLite database for productivity events — [src-tauri/src/database/db.rs](src-tauri/src/database/db.rs#L1)
- [x] Active window + idle detection (Windows API) — [src-tauri/src/tracking/tracker.rs](src-tauri/src/tracking/tracker.rs#L1)
- [x] App/site classification system — [src-tauri/src/tracking/classifier.rs](src-tauri/src/tracking/classifier.rs#L1)
- [x] Productivity → Simulation bridge — [src/simulation/systems/ProductivityInfluenceSystem.ts](src/simulation/systems/ProductivityInfluenceSystem.ts#L1)
- [x] Construction/build mode with ghost preview — [src/simulation/systems/ConstructionSystem.ts](src/simulation/systems/ConstructionSystem.ts#L1)
- [x] Job system (5 job types) — [src/simulation/systems/JobSystem.ts](src/simulation/systems/JobSystem.ts#L1)
- [x] Chronotype-based schedules — [src/simulation/systems/ScheduleSystem.ts](src/simulation/systems/ScheduleSystem.ts#L1)
- [x] Productivity dashboard (Recharts) — [src/ui/ProductivityDashboard.tsx](src/ui/ProductivityDashboard.tsx#L1)
- [x] Simulation save/load (serialization + Rust persistence) — [src/simulation/SimulationSerializer.ts](src/simulation/SimulationSerializer.ts#L1), [src/simulation/SimulationStorage.ts](src/simulation/SimulationStorage.ts#L1), [src-tauri/src/commands/simulation.rs](src-tauri/src/commands/simulation.rs#L1)
- [x] Pause/play and speed controls (0.5x–4x) — [src/app/App.tsx](src/app/App.tsx#L161)
- [x] Simulation serializer + deserializer (full state JSON roundtrip)
- [x] Stateless dirty-flag rendering — [src/rendering/scenes/CityScene.ts](src/rendering/scenes/CityScene.ts#L1)
- [x] WebSocket server for browser extension — [src-tauri/src/network/mod.rs](src-tauri/src/network/mod.rs#L1)
- [x] Configurable classifier with Tauri commands — [src-tauri/src/commands/config.rs](src-tauri/src/commands/config.rs#L1)

# Phase 1 — Desktop Productivity Tracker

## Desktop App

* [x] Create Tauri application
* [x] Setup React frontend
* [x] SQLite database setup

## Activity Monitoring

* [x] Detect active window (Rust polling via Windows API)
* [x] Detect application usage (process name + window title)
* [x] Detect idle time (GetLastInputInfo)
* [x] Track keyboard activity (global listener via rdev)
* [x] Track mouse activity (global listener via rdev)

## Browser Tracking

* [x] WebSocket server in Tauri (ws://127.0.0.1:9736)
* [x] Website tracking (full URL via browser extension)
* [x] Domain categorization
* [x] Distraction detection
* [ ] Extension distribution / auto-install

## Data Storage

* [x] Session history
* [x] Daily analytics
* [x] Productivity logs
* [x] Classifier config persistence (app_config table)
* [x] Extension connection status (AtomicBool, Tauri command)
* [ ] Time-series tracking (advanced bucketing)

---

## Simulation & Rendering

* [x] Configurable classifier (focus/distraction URLs, poll interval, idle timeout)
* [x] Keyboard/mouse activity detection (rdev global listener)
* [x] WebSocket browser extension integration
* [x] Pokémon-style movement lock (movingTicks, facingDirection, ActionTargetSystem skip)
* [x] Smooth movement interpolation (tickProgress in CityScene)
* [ ] Sprite loading pipeline (SpriteLoader, CitizenSpritesheet)
* [ ] Actual spritesheet assets integrated

---

# Phase 2 — Productivity Analytics

## Focus Detection

* [ ] Deep work detection
* [ ] Alt-tab frequency analysis
* [ ] Focus session scoring
* [ ] Context switching detection

## Behavioral Analytics

* [x] Procrastination score
* [ ] Burnout prediction
* [ ] Fatigue estimation
* [ ] Focus trend analysis

## Visualization

* [x] Charts (Recharts stacked bar)
* [x] Productivity timeline
* [ ] Heatmaps
* [x] Daily reports

---

# Phase 3 — Real World ↔ Simulation Sync

## Productivity Influence

* [x] Real productivity boosts city economy
* [x] Focus sessions improve citizen morale
* [x] Deep work increases city growth

## Procrastination Influence

* [x] Doomscrolling increases burnout
* [x] Distractions reduce productivity
* [x] Multitasking affects citizen stress

## Emotional Sync

* [x] User fatigue affects citizens
* [x] User focus affects AI behavior
* [ ] User habits shape city culture

---

# Phase 4 — Advanced City Simulation

## Traffic

* [x] Advanced pathfinding (A*)
* [x] Traffic congestion (occupancy-based penalty system)
* [ ] Road hierarchy
* [ ] Intersections

## Infrastructure

* [ ] Electricity
* [ ] Water systems
* [ ] Garbage collection
* [ ] Public transport

## Environment

* [ ] Pollution
* [ ] Noise
* [ ] Seasons
* [ ] Weather expansion

---

# Phase 5 — Advanced Society Simulation

## Families & Citizen Lifecycle

* [ ] Age tracking (birth tick, life stages)
* [ ] Children (spawn, growth, education)
* [ ] Education system (schools, skill progression, career access)
* [ ] Career specialization (education level unlocks better jobs)
* [ ] Couples & marriage
* [ ] Aging (stat decay, retirement)
* [ ] Death (natural, accident, health < 0)
* [ ] Emigration (unhappiness, economic factors)
* [ ] Replacement cycle (new citizens to fill vacancies)

## Social Structures

* [ ] Communities
* [ ] Friend groups
* [ ] Workplace culture
* [ ] Neighborhood identity

## Crime

* [ ] Criminal behavior
* [ ] Police
* [ ] Dangerous districts
* [ ] Economic inequality

---

# Phase 6 — Advanced Psychology

## Mental Systems

* [ ] Depression
* [ ] Anxiety disorders
* [ ] Attention span
* [ ] Addiction simulation

## Productivity Systems

* [ ] Dopamine simulation
* [ ] Digital distraction mechanics
* [ ] Phone addiction
* [ ] Recovery cycles

---

# Phase 7 — AI & Emergent Behavior

## Advanced AI

* [ ] Long-term goals
* [ ] Dynamic personalities
* [ ] Life ambitions
* [x] Decision memories

## Emergence

* [ ] Economic crises (recessions, inflation, market crashes)
* [ ] Burnout epidemics (contagious stress spirals)
* [ ] Social collapse (mass emigration, abandonment)
* [ ] Productivity booms (innovation eras)
* [ ] Natural disasters (fire, flood, earthquake)
* [ ] Epidemics (contagious illness spreading through proximity)

---

# Phase 8 — Visual & UX Improvements

## Graphics

* [ ] Sprites (loader + sheet needed)
* [ ] Animations (interpolation done, frames need spritesheet)
* [x] Lighting (day/night/weather overlays)
* [ ] Particle effects

## UI

* [ ] Modern HUD
* [ ] Minimap
* [x] Statistics panels
* [x] Productivity dashboards (Recharts)

---

# Phase 9 — Save & Persistence

## Saves

* [x] Save system (simulation state via Tauri + SQLite)
* [ ] Autosave
* [x] Persistent citizens (included in save state)
* [x] Persistent analytics (SQLite)
* [x] Named saves with load/delete

## Cloud

* [ ] Sync
* [ ] Online backup
* [ ] Cross-device support

---

# Phase 10 — Machine Learning

## AI Predictions

* [ ] Predict procrastination
* [ ] Predict burnout
* [ ] Predict focus windows
* [ ] Smart recommendations

## Adaptive Systems

* [ ] Personalized productivity coaching
* [ ] Intelligent interventions
* [ ] Dynamic city balancing

---

# Final Vision

A living simulation where:

* your real-world behavior shapes a civilization
* your productivity affects economy and society
* your habits influence autonomous AI citizens
* your stress and focus become visible through simulation

FocusTown aims to transform productivity, behavioral analytics, and emergent AI into a living autonomous digital world.
