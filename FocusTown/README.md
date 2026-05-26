# FocusTown

FocusTown is a real-time autonomous city simulation powered by behavioral analytics and productivity systems.

The project combines:

* city-building simulation
* autonomous AI agents
* behavioral psychology systems
* productivity analytics
* economy simulation
* real-world activity tracking
* emergent AI-driven societies
* real-time rendering

The long-term vision is to create a living virtual city where citizens evolve dynamically based on:

* needs
* routines
* emotions
* habits
* relationships
* productivity
* stress
* environment
* and eventually the real-world behavior of the user.

---

# Core Idea

FocusTown explores the concept of:

> “a city that reflects human focus and productivity.”

The project merges two concepts:

## 1. Autonomous City Simulation

A fully simulated city populated by autonomous citizens.

Each citizen:

* works
* sleeps
* eats
* socializes
* earns money
* develops habits
* experiences emotions
* forms relationships
* reacts to stress and burnout
* follows routines
* makes decisions independently

The simulation is designed around emergent systems:
simple rules generating complex large-scale behaviors.

---

## 2. Real-World Productivity Tracker

A desktop productivity tracker capable of detecting:

* distractions
* alt-tab frequency
* idle time
* doomscrolling
* focus sessions
* multitasking
* deep work
* burnout patterns
* behavioral trends

The goal is to connect real-world productivity data directly to the simulation.

---

# The Twist

Your real behavior affects the city.

Examples:

* productive work sessions improve the economy
* deep work boosts citizen morale
* distractions increase stress
* procrastination spreads burnout
* unhealthy routines destabilize the city

The city becomes a behavioral mirror of the user.

---

# Philosophy

FocusTown is not just a game prototype.

It is an experimental simulation sandbox focused on:

* emergent behavior
* autonomous systems
* human productivity modeling
* digital societies
* behavioral psychology
* scalable simulation architecture

The project aims to progressively evolve from a simple simulation into a living autonomous world driven by both simulated and real-world human behavior.

---

# Current Features

# Simulation Engine

## Core Architecture

* real-time simulation loop
* tick-based architecture
* modular systems architecture
* ECS-inspired organization
* autonomous entities

---

# Citizens

Each citizen has:

## Basic Stats

* position
* energy
* hunger
* mood
* money
* hygiene
* fun
* health

## Personality Traits

* diligence
* sociability
* laziness
* anxiety
* confidence
* perfectionism
* discipline

## Psychological Systems

* stress
* burnout
* procrastination
* motivation
* emotional states
* routines
* habits

## Social Systems

* friendships
* relationship persistence
* social decay
* emotional contagion

## Locations

* home
* workplace
* restaurants
* dynamic movement targets

---

# AI Systems

## Utility AI

Citizens dynamically choose actions based on:

* needs
* emotions
* habits
* memories
* routines
* stress
* personality

Actions include:

* work
* sleep
* eat
* socialize
* relax
* wander

---

## Movement System

Handles:

* movement
* path following
* navigation
* route execution

---

## Pathfinding System

Current:

* tile-based pathfinding

Planned:

* A* pathfinding
* traffic-aware navigation

---

## Needs System

Simulates:

* hunger
* fatigue
* mood
* energy
* stress

---

## Habit System

Citizens progressively build routines over time.

Examples:

* workaholics
* procrastinators
* highly social citizens
* lazy citizens

Repeated behaviors reinforce future decisions.

---

## Memory System

Citizens remember:

* positive experiences
* negative experiences
* social interactions
* stressful work sessions

Memories influence future choices and emotional states.

---

## Emotion System

Citizens can become:

* happy
* neutral
* sad
* anxious
* burned out

Emotions directly affect:

* productivity
* socialization
* motivation
* routines
* stress

---

## Social System

Citizens:

* form friendships
* influence each other emotionally
* spread stress
* experience isolation
* develop social networks

---

# World Simulation

## Tile-Based World

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

Features:

* capacity
* comfort
* cleanliness
* zoning support

---

# City Systems

## Economy

The economy currently includes:

* salaries
* taxes
* money flow
* restaurant spending
* city budget
* maintenance costs

---

## Population

* automatic citizen spawning
* population cap
* residential demand

---

## Zoning

* residential zones
* commercial zones
* auto-generated buildings

---

## Weather & Time

Includes:

* day/night cycle
* time simulation
* weather states
* chronotypes

Weather:

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
* emotional color indicators
* camera movement
* zoom system

---

# UI

The interface is built with:

# React

Current HUD features:

* current day/time
* citizen inspector
* building inspector
* productivity analytics
* emotional analytics
* build mode
* city statistics

---

# Productivity Simulation

FocusTown already includes:

* procrastination mechanics
* burnout mechanics
* stress accumulation
* motivation systems
* behavioral routines
* productivity scoring

This forms the foundation for future real-world productivity integration.

---

# Productivity Analytics Vision

The long-term goal is to build a desktop productivity tracker capable of:

## Activity Monitoring

* active window tracking
* application usage
* idle detection
* keyboard activity
* mouse activity

## Browser Monitoring

* website tracking
* domain categorization
* distraction detection
* doomscroll detection

## Focus Analytics

* deep work detection
* context switching analysis
* focus scoring
* burnout prediction
* productivity trends

---

# Real World ↔ Simulation Sync

The final vision is to connect:

# real productivity data directly to the city simulation.

Examples:

## Real Deep Work

* boosts economy
* increases citizen morale
* reduces burnout

## Procrastination

* spreads stress
* lowers productivity
* destabilizes social systems

## Healthy Habits

* improve city growth
* increase citizen happiness
* strengthen relationships

The city becomes a living reflection of:

* focus
* discipline
* routines
* stress
* burnout
* productivity

---

# Current Architecture

```txt id="w7m2pk"
src/
├── simulation/
│   ├── ai/
│   ├── engine/
│   ├── entities/
│   ├── systems/
│   ├── world/
│   └── config/
│
├── rendering/
│   └── scenes/
│
├── ui/
│
├── app/
│
└── shared/
```

---

# Technologies

## Frontend

* React
* TypeScript
* PixiJS
* Vite

## Desktop App (Planned)

* Tauri
* Rust

Alternative:

* Electron

## Database

Planned:

* SQLite
* PostgreSQL

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

# Goals of the Project

This project is designed to:

* learn advanced software architecture
* explore simulation systems
* experiment with emergent AI
* practice game engine concepts
* build scalable frontend systems
* understand autonomous systems
* explore behavioral analytics
* model human productivity digitally

---

# Long-Term Vision

FocusTown aims to become:

## A Real Productivity Companion

capable of:

* tracking focus
* detecting procrastination
* predicting burnout
* analyzing routines
* generating behavioral insights

---

## A Living Autonomous Society

Where:

* citizens evolve dynamically
* relationships emerge naturally
* economies react autonomously
* stress spreads socially
* burnout epidemics can appear
* cultures form organically

---

## A Behavioral Mirror

A simulation where:

* your real-world behavior shapes a civilization
* your productivity affects society
* your routines influence AI citizens
* your mental state becomes visible through simulation

The city becomes a reflection of:

* focus
* discipline
* habits
* burnout
* routines
* productivity
* emotional health

---

# Roadmap

## Phase 1 — Desktop Productivity Tracker

### Desktop App

* [ ] Create Tauri application
* [ ] Setup React frontend
* [ ] Setup SQLite database

### Activity Monitoring

* [ ] Detect active window
* [ ] Detect application usage
* [ ] Track idle time
* [ ] Track keyboard activity
* [ ] Track mouse activity

### Browser Tracking

* [ ] Website tracking
* [ ] Domain categorization
* [ ] Distraction detection
* [ ] Doomscroll detection

### Data Storage

* [ ] Session history
* [ ] Daily analytics
* [ ] Productivity logs
* [ ] Time-series tracking

---

## Phase 2 — Productivity Analytics

### Focus Detection

* [ ] Deep work detection
* [ ] Alt-tab frequency analysis
* [ ] Focus session scoring
* [ ] Context switching detection

### Behavioral Analytics

* [ ] Procrastination score
* [ ] Burnout prediction
* [ ] Fatigue estimation
* [ ] Focus trend analysis

### Visualization

* [ ] Charts
* [ ] Productivity timeline
* [ ] Heatmaps
* [ ] Daily reports

---

## Phase 3 — Real World ↔ Simulation Sync

### Productivity Influence

* [ ] Real productivity boosts city economy
* [ ] Focus sessions improve citizen morale
* [ ] Deep work increases city growth

### Procrastination Influence

* [ ] Doomscrolling increases burnout
* [ ] Distractions reduce productivity
* [ ] Multitasking affects citizen stress

### Emotional Sync

* [ ] User fatigue affects citizens
* [ ] User focus affects AI behavior
* [ ] User habits shape city culture

---

## Phase 4 — Advanced City Simulation

### Traffic

* [ ] Advanced pathfinding (A*)
* [ ] Traffic congestion
* [ ] Road hierarchy
* [ ] Intersections

### Infrastructure

* [ ] Electricity
* [ ] Water systems
* [ ] Garbage collection
* [ ] Public transport

### Environment

* [ ] Pollution
* [ ] Noise
* [ ] Weather expansion
* [ ] Seasons

---

## Phase 5 — Advanced Society Simulation

### Families

* [ ] Couples
* [ ] Marriage
* [ ] Children
* [ ] Aging
* [ ] Death

### Social Structures

* [ ] Friend groups
* [ ] Communities
* [ ] Workplace culture
* [ ] Neighborhood identity

### Crime

* [ ] Criminal behavior
* [ ] Police
* [ ] Dangerous districts
* [ ] Economic inequality

---

## Phase 6 — Advanced Psychology

### Mental Systems

* [ ] Depression
* [ ] Anxiety disorders
* [ ] Addiction simulation
* [ ] Attention span

### Productivity Systems

* [ ] Dopamine simulation
* [ ] Digital distraction mechanics
* [ ] Phone addiction
* [ ] Recovery cycles

---

## Phase 7 — AI & Emergent Behavior

### Advanced AI

* [ ] Long-term goals
* [ ] Dynamic personalities
* [ ] Life ambitions
* [ ] Decision memories

### Emergence

* [ ] Economic crises
* [ ] Social collapse
* [ ] Burnout epidemics
* [ ] Productivity booms

---

## Phase 8 — Visual & UX Improvements

### Graphics

* [ ] Sprites
* [ ] Animations
* [ ] Lighting
* [ ] Particle effects

### UI

* [ ] Modern HUD
* [ ] Minimap
* [ ] Statistics panels
* [ ] Productivity dashboards

---

## Phase 9 — Save & Persistence

### Saves

* [ ] Save system
* [ ] Autosave
* [ ] Persistent citizens
* [ ] Persistent analytics

### Cloud

* [ ] Sync
* [ ] Online backup
* [ ] Cross-device support

---

## Phase 10 — Machine Learning

### AI Predictions

* [ ] Predict procrastination
* [ ] Predict burnout
* [ ] Predict focus windows
* [ ] Smart recommendations

### Adaptive Systems

* [ ] Personalized productivity coaching
* [ ] Intelligent interventions
* [ ] Dynamic city balancing

---

# Final Goal

A living simulation where:

* your real-world behavior shapes a virtual civilization
* your productivity affects economy and society
* your habits influence autonomous AI citizens
* your stress and focus become visible through simulation

FocusTown aims to transform productivity and behavioral analytics into a living autonomous world.
