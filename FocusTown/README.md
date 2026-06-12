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

> “a city that reflects human focus and productivity.”

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

The tracker will eventually synchronize real-world productivity data directly into the simulation.

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

* real-time simulation loop
* tick-based architecture
* modular systems
* ECS-inspired structure
* autonomous entities

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
* emotional states
* behavioral routines

---

## Social Systems

* friendships
* relationship persistence
* emotional contagion
* social decay

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

* procedurally generated
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

Buildings support:

* capacity
* comfort
* cleanliness
* zoning

---

# Economy Simulation

Current systems:

* salaries
* taxes
* money circulation
* restaurant spending
* city budget
* maintenance costs

---

# Population Simulation

Includes:

* automatic population growth
* residential demand
* housing systems
* population caps

---

# Zoning

Current zoning types:

* residential
* commercial

Zones can automatically generate buildings over time.

---

# Weather & Time

Includes:

* day/night cycle
* weather simulation
* chronotypes
* schedules

Weather states:

* sunny
* rain
* fog
* storm

---

# Rendering

The project uses:

# PixiJS

for:

* high-performance rendering
* scalable 2D graphics
* real-time simulation visualization

Current rendering features:

* tile rendering
* citizen rendering
* building rendering
* camera movement
* zoom system

---

# UI

The interface is built with:

# React

Current UI systems:

* citizen inspector
* building inspector
* build mode
* analytics HUD
* simulation statistics
* time controls

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

# Architecture

FocusTown follows a modular architecture inspired by:

* simulation engines
* city builders
* game engines
* ECS-inspired systems

---

# Folder Structure

```txt
src/
├── simulation/         # Simulation engine, systems, entities
│   ├── ai/             # Utility AI, scoring, memory
│   ├── engine/         # Tick loop, system orchestration
│   ├── entities/       # Citizens, buildings, tiles
│   ├── systems/        # 20+ independent simulation systems
│   ├── world/          # World generation, weather, zoning
│   └── config/         # Global constants
│
├── rendering/          # PixiJS visual layer
│   └── scenes/         # CityScene — tile, citizen, building rendering
│
├── store/              # Zustand stores (simulation, UI, productivity)
├── productivity/       # Types, summaries, localStorage persistence
├── tracking/           # Tauri event listeners (active window tracking)
├── ui/                 # React components (HUD, dashboards)
├── app/                # Application entry point (App.tsx)
├── database/           # (future SQLite)
├── components/         # (future shared components)
├── hooks/              # (future custom hooks)
├── services/           # (future service layer)
├── types/              # (future shared types)
├── utils/              # (future utilities)
├── pages/              # (future routing)
└── styles/             # (future global styles)

src-tauri/
└── src/
    ├── commands/       # Tauri IPC commands (start_tracking, etc.)
    ├── tracking/       # Windows API active window detection
    ├── database/       # (future SQLite)
    ├── system/         # (future system-level features)
    ├── utils/          # (future utilities)
    ├── lib.rs          # Tauri app builder
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

* ticks
* system execution
* world updates

---

### entities/

Simulation entities.

Examples:

* citizens
* buildings
* relationships

---

### systems/

Independent simulation systems.

Examples:

* movement
* social simulation
* economy
* memory
* psychology

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

Global constants and configuration.

---

# Tick Lifecycle

The simulation uses a deterministic tick-based architecture.

Each tick updates the entire world state.

---

# Tick Flow

```txt
Simulation Tick
│
├── update time
├── update weather
├── update schedules
├── update memories
├── update AI decisions
├── update pathfinding
├── update movement
├── update needs
├── update emotions
├── update economy
├── update social systems
├── update population
├── update city economy
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

# MovementSystem

Handles:

* movement
* path following
* navigation execution

---

# PathfindingSystem

Current:

* A* pathfinding with traffic-aware routing
* occupancy-based traffic penalty system
* shortest-path optimization via movementCost heuristics

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

* salaries
* taxes
* spending
* money circulation

---

# SocialSystem

Handles:

* friendships
* emotional contagion
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
* chronotypes
* productivity windows

---

# PopulationSystem

Handles:

* spawning
* housing availability
* population growth
* demand simulation

---

# Rendering Pipeline

Rendering is separated from simulation logic.

Simulation:

* updates state

Rendering:

* visualizes state only

Benefits:

* maintainability
* scalability
* debugging
* optimization

---

# Technologies

## Frontend

* React + Zustand (state management)
* TypeScript
* PixiJS v8 (WebGPU/WebGL rendering)
* Vite

## Desktop

* Tauri v2 (Rust backend)
* Windows API (active window detection via `windows` crate)

---

## Database

Planned:

* SQLite
* PostgreSQL

---

# Installation

# Requirements

* Node.js 18+
* npm or pnpm
* Git

Optional:

* Rust
* Tauri CLI

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

Start development server:

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

* no save system (localStorage only for productivity events)
* no ECS implementation yet
* limited optimization for 1000+ citizens
* no persistence for simulation state
* no real productivity sync yet (manual buttons + active window polling)

---

# Immediate TODOs

# Simulation

* optimize citizen updates for 1000+ targets
* improve zoning auto-construction
* improve city economy balancing

---

# AI

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
* [x] build analytics dashboard
* [ ] track browser websites
* [ ] track idle time

---

# Productivity Tracker Vision

The future desktop tracker will monitor:

* active applications
* browser activity
* idle time
* multitasking
* distractions
* focus sessions
* behavioral patterns

The tracker will influence:

* citizen morale
* economy
* stress
* burnout
* city stability

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

# Phase 1 — Desktop Productivity Tracker

## Desktop App

* [x] Create Tauri application
* [x] Setup React frontend
* [ ] Setup SQLite database

## Activity Monitoring

* [x] Detect active window (Rust polling via Windows API)
* [x] Detect application usage (process name + window title)
* [ ] Track idle time
* [ ] Track keyboard activity
* [ ] Track mouse activity

## Browser Tracking

* [ ] Website tracking
* [ ] Domain categorization
* [ ] Distraction detection
* [ ] Doomscroll detection

## Data Storage

* [ ] Session history
* [ ] Daily analytics
* [ ] Productivity logs
* [ ] Time-series tracking

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

* [ ] Charts
* [ ] Productivity timeline
* [ ] Heatmaps
* [ ] Daily reports

---

# Phase 3 — Real World ↔ Simulation Sync

## Productivity Influence

* [ ] Real productivity boosts city economy
* [ ] Focus sessions improve citizen morale
* [ ] Deep work increases city growth

## Procrastination Influence

* [ ] Doomscrolling increases burnout
* [ ] Distractions reduce productivity
* [ ] Multitasking affects citizen stress

## Emotional Sync

* [ ] User fatigue affects citizens
* [ ] User focus affects AI behavior
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

## Families

* [ ] Couples
* [ ] Marriage
* [ ] Children
* [ ] Aging
* [ ] Death

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

* [ ] Economic crises
* [ ] Burnout epidemics
* [ ] Social collapse
* [ ] Productivity booms

---

# Phase 8 — Visual & UX Improvements

## Graphics

* [ ] Sprites
* [ ] Animations
* [x] Lighting
* [ ] Particle effects

## UI

* [ ] Modern HUD
* [ ] Minimap
* [x] Statistics panels
* [ ] Productivity dashboards

---

# Phase 9 — Save & Persistence

## Saves

* [ ] Save system
* [ ] Autosave
* [ ] Persistent citizens
* [ ] Persistent analytics

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
