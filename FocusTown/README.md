# Projet-perso

# Roadmap

## V1 — Foundation

### Desktop App

* [ ] Setup Tauri + React + TypeScript
* [ ] Configure TailwindCSS
* [ ] Create basic application layout
* [ ] Add global state management
* [ ] Setup project architecture

### Activity Tracking

* [ ] Detect active application/window
* [ ] Track application usage duration
* [ ] Store activity history
* [ ] Create productivity scoring system
* [ ] Real-time focus score updates

### Simulation Engine

* [ ] Create simulation tick loop
* [ ] Add city state management
* [ ] Implement citizen entities
* [ ] Add citizen movement system
* [ ] Create economy system
* [ ] Create mood/happiness system

### City Rendering

* [ ] Setup PixiJS renderer
* [ ] Render map grid
* [ ] Render citizens
* [ ] Render buildings
* [ ] Add basic animations
* [ ] Add weather/day cycle

### Productivity ↔ City Connection

* [ ] Link focus score to economy
* [ ] Link procrastination to city decline
* [ ] Add visual feedback from productivity
* [ ] Add dynamic city mood
* [ ] Add event notifications

### Persistence

* [ ] Setup SQLite database
* [ ] Save city state
* [ ] Save activity history
* [ ] Restore session on startup

### UI / Dashboard

* [ ] Real-time focus dashboard
* [ ] Activity statistics
* [ ] City statistics panel
* [ ] Session summary
* [ ] Daily productivity report

---

# V1.5 — Polish

* [ ] Sound effects
* [ ] Better animations
* [ ] Improved UI/UX
* [ ] More citizen behaviors
* [ ] Better balancing
* [ ] Performance optimizations

---

# V2 — Advanced Simulation

### Expanded City Systems

* [ ] Crime system
* [ ] Traffic system
* [ ] Dynamic economy
* [ ] Resource management
* [ ] Weather impact system

### Citizens

* [ ] Jobs and workplaces
* [ ] Relationships
* [ ] Personality traits
* [ ] Daily routines
* [ ] Memory system

### Productivity Analysis

* [ ] Deep work detection
* [ ] Distraction pattern analysis
* [ ] Burnout detection
* [ ] Weekly/monthly trends
* [ ] Productivity predictions

### Visualization

* [ ] Improved graphics
* [ ] Zoom system
* [ ] Camera controls
* [ ] Advanced particle effects
* [ ] Dynamic lighting

---

# V3 — Intelligent City

* [ ] AI-generated events
* [ ] Dynamic storytelling
* [ ] Adaptive city evolution
* [ ] Smart citizen behavior
* [ ] Personalized recommendations
* [ ] Procedural world generation

---

# Future Ideas

* [ ] Multiplayer shared cities
* [ ] Mobile companion app
* [ ] Cloud sync
* [ ] Plugin/mod system
* [ ] Steam release
* [ ] Community challenges
* [ ] Custom themes
* [ ] Achievement system
* [ ] Leaderboards
* [ ] Full simulation sandbox



```txt id="o7aj0m"
FocusTown/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
│
├── .vscode/
│
├── public/
│
├── assets/
│   ├── audio/
│   │   ├── ambience/
│   │   ├── music/
│   │   └── sfx/
│   │
│   ├── fonts/
│   │
│   ├── icons/
│   │
│   ├── textures/
│   │   ├── buildings/
│   │   ├── citizens/
│   │   ├── environment/
│   │   └── ui/
│   │
│   └── shaders/
│
├── docs/
│   ├── architecture.md
│   ├── simulation.md
│   ├── tracking.md
│   ├── rendering.md
│   └── roadmap.md
│
├── scripts/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   ├── providers/
│   │   └── layouts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── city/
│   │   ├── analytics/
│   │   └── shared/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Statistics/
│   │   ├── Settings/
│   │   └── Debug/
│   │
│   ├── simulation/
│   │   │
│   │   ├── engine/
│   │   │   ├── SimulationEngine.ts
│   │   │   ├── TickManager.ts
│   │   │   ├── TimeSystem.ts
│   │   │   └── GameLoop.ts
│   │   │
│   │   ├── entities/
│   │   │   ├── Citizen.ts
│   │   │   ├── Building.ts
│   │   │   ├── Vehicle.ts
│   │   │   └── Environment.ts
│   │   │
│   │   ├── systems/
│   │   │   ├── EconomySystem.ts
│   │   │   ├── MoodSystem.ts
│   │   │   ├── MovementSystem.ts
│   │   │   ├── WeatherSystem.ts
│   │   │   ├── PopulationSystem.ts
│   │   │   ├── EnergySystem.ts
│   │   │   └── FocusImpactSystem.ts
│   │   │
│   │   ├── world/
│   │   │   ├── City.ts
│   │   │   ├── Map.ts
│   │   │   ├── District.ts
│   │   │   └── Tile.ts
│   │   │
│   │   ├── events/
│   │   │   ├── EventBus.ts
│   │   │   ├── EventTypes.ts
│   │   │   └── SimulationEvents.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── economy.ts
│   │   │   ├── citizens.ts
│   │   │   ├── weather.ts
│   │   │   └── simulation.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── random.ts
│   │   │   ├── math.ts
│   │   │   └── generators.ts
│   │   │
│   │   └── types/
│   │       ├── simulation.ts
│   │       ├── citizens.ts
│   │       └── economy.ts
│   │
│   ├── tracking/
│   │   │
│   │   ├── activity/
│   │   │   ├── ActivityTracker.ts
│   │   │   ├── ActiveWindow.ts
│   │   │   └── SessionTracker.ts
│   │   │
│   │   ├── scoring/
│   │   │   ├── FocusScore.ts
│   │   │   ├── ProductivityRules.ts
│   │   │   └── ScoreCalculator.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── DailyAnalytics.ts
│   │   │   ├── WeeklyAnalytics.ts
│   │   │   └── TrendAnalysis.ts
│   │   │
│   │   ├── events/
│   │   │   └── TrackingEvents.ts
│   │   │
│   │   ├── constants/
│   │   │   └── applications.ts
│   │   │
│   │   └── types/
│   │       └── tracking.ts
│   │
│   ├── rendering/
│   │   │
│   │   ├── pixi/
│   │   │   ├── PixiApp.ts
│   │   │   ├── Renderer.ts
│   │   │   └── AssetLoader.ts
│   │   │
│   │   ├── scenes/
│   │   │   ├── CityScene.ts
│   │   │   ├── UIScene.ts
│   │   │   └── DebugScene.ts
│   │   │
│   │   ├── camera/
│   │   │   ├── Camera.ts
│   │   │   └── Controls.ts
│   │   │
│   │   ├── entities/
│   │   │   ├── CitizenSprite.ts
│   │   │   ├── BuildingSprite.ts
│   │   │   └── WeatherEffects.ts
│   │   │
│   │   ├── ui/
│   │   │   ├── HUD.ts
│   │   │   ├── Panels.ts
│   │   │   └── Notifications.ts
│   │   │
│   │   └── utils/
│   │       └── rendering.ts
│   │
│   ├── database/
│   │   │
│   │   ├── client/
│   │   │   └── sqlite.ts
│   │   │
│   │   ├── models/
│   │   │   ├── ActivityModel.ts
│   │   │   ├── CitizenModel.ts
│   │   │   └── CityStateModel.ts
│   │   │
│   │   ├── repositories/
│   │   │   ├── ActivityRepository.ts
│   │   │   ├── CityRepository.ts
│   │   │   └── CitizenRepository.ts
│   │   │
│   │   ├── migrations/
│   │   │
│   │   └── seed/
│   │
│   ├── services/
│   │   ├── simulation.service.ts
│   │   ├── tracking.service.ts
│   │   ├── save.service.ts
│   │   ├── audio.service.ts
│   │   └── notification.service.ts
│   │
│   ├── store/
│   │   ├── simulation.store.ts
│   │   ├── tracking.store.ts
│   │   ├── ui.store.ts
│   │   └── settings.store.ts
│   │
│   ├── hooks/
│   │   ├── useSimulation.ts
│   │   ├── useTracking.ts
│   │   ├── useTick.ts
│   │   └── useWeather.ts
│   │
│   ├── types/
│   │   ├── global.ts
│   │   ├── api.ts
│   │   └── shared.ts
│   │
│   ├── utils/
│   │   ├── time.ts
│   │   ├── logger.ts
│   │   ├── storage.ts
│   │   └── format.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── src-tauri/
│   │
│   ├── src/
│   │   │
│   │   ├── commands/
│   │   │   ├── tracking.rs
│   │   │   ├── storage.rs
│   │   │   └── system.rs
│   │   │
│   │   ├── tracking/
│   │   │   ├── active_window.rs
│   │   │   ├── process_monitor.rs
│   │   │   └── idle_detection.rs
│   │   │
│   │   ├── database/
│   │   │   └── sqlite.rs
│   │   │
│   │   ├── system/
│   │   │   ├── notifications.rs
│   │   │   ├── filesystem.rs
│   │   │   └── os.rs
│   │   │
│   │   ├── utils/
│   │   │   └── logger.rs
│   │   │
│   │   └── main.rs
│   │
│   ├── Cargo.toml
│   ├── build.rs
│   ├── tauri.conf.json
│   └── capabilities/
│
├── tests/
│   ├── simulation/
│   ├── tracking/
│   └── rendering/
│
├── .env
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
