# CS Offline - Complete Project Structure

## 📁 File Organization

```
csgo-offline/
├── index.html                 # Main game UI, menu system, HUD
├── QUICKSTART.md             # Quick start guide
├── README.md                 # Full documentation
├── PROJECT_STRUCTURE.md      # This file
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript compiler settings
├── tsconfig.node.json        # Vite config TypeScript
├── vite.config.ts            # Build & dev server config
│
└── src/                      # Game source code (TypeScript)
    ├── game.ts               # Main game engine & loop (400 lines)
    ├── player.ts             # First-person player controller (350 lines)
    ├── bot.ts                # Bot AI with 4 difficulty levels (300 lines)
    ├── weapons.ts            # Weapon system, 10 weapons (250 lines)
    ├── gamemodes.ts          # 8 different game modes (100 lines)
    └── map.ts                # Dust II environment & spawns (150 lines)
```

**Total: ~1,550 lines of modular TypeScript**

---

## 🎮 Game Engine Architecture

### Core Loop (`game.ts`)
- Initialization: Three.js scene, camera, renderer
- Game state management (players, bots, stats)
- Animation loop with delta time
- HUD updates (kills, accuracy, health, ammo)
- Round management & end conditions
- Pause/resume functionality

### Player Controller (`player.ts`)
- First-person camera with mouse look
- WASD movement + sprint/crouch
- Gravity & jumping physics
- Weapon switching (1/2/3 keys, scroll wheel)
- Firing, reloading, inspection
- Health/armor system
- Sensitivity adjustment
- Crosshair & scope rendering

### Bot AI (`bot.ts`)
**Difficulty System:**
- Easy: 40% accuracy, 1.0s reaction time
- Medium: 70% accuracy, 0.5s reaction time  
- Hard: 85% accuracy, 0.2s reaction time
- Expert: 95% accuracy, 0.05s reaction time

**Behaviors:**
- Target detection (line-of-sight check)
- Reaction time delays
- Intelligent aiming (with error compensation)
- Distance-based accuracy reduction
- Headshot probability scaling
- Movement towards/away from targets
- Patrol/idle behavior
- Damage system (armor penetration)

### Weapons System (`weapons.ts`)
**10 Weapons Database:**
1. AK-47 - 31 dmg, 10 rpm, 65% acc (best rifle)
2. M4A1 - 21 dmg, 13.33 rpm, 80% acc (CT rifle)
3. AWP - 115 dmg, 1.15 rpm, 98% acc (one-shot sniper)
4. Desert Eagle - 63 dmg, 1.5 rpm, 81% acc (eco pistol)
5. Glock-18 - 18 dmg, 15 rpm, 50% acc (starter)
6. MP5-SD - 25 dmg, 15 rpm, 65% acc (SMG)
7. UMP-45 - 35 dmg, 9.1 rpm, 70% acc (SMG)
8. XM1014 - 20 dmg, 2.25 rpm, 40% acc (shotgun)
9. Nova - 26 dmg, 1.5 rpm, 30% acc (shotgun)
10. Knife - 40 dmg, 2m range, instant melee

**Mechanics:**
- Damage calculation with armor reduction
- Recoil accumulation system
- Accuracy falloff during firing
- Scoped weapons (AWP only)
- Reload timing (weapon-specific)
- Ammo management
- Range-based damage falloff
- Armor penetration values

### Game Modes (`gamemodes.ts`)
**8 Complete Modes:**

1. **Free-For-All** (FFA)
   - 4 bots, 5 min rounds
   - Win: First to 30 kills
   - Unlimited ammo, no regen

2. **Team Deathmatch** (TDM)
   - 4 bots (2v2), 10 min rounds
   - Win: First team to 50 kills
   - Health regen enabled

3. **Gun Game**
   - 3 bots, 30 min progression
   - Rotate through 10 weapons
   - Last weapon is knife kill
   - Instant respawn

4. **Aim Arena**
   - 8 bots, 10 min rounds
   - Pure aim training
   - Win: 100 kills target
   - High bot density

5. **Weapon Mastery**
   - 4 bots, 5 min
   - Focus on 4 weapon types
   - Win: 25 kills
   - Rotate between AK/M4/AWP/Deagle

6. **Spray Control**
   - 1 bot (expert), 2 min
   - Practice recoil patterns
   - Health regen enabled
   - Win: 5 kills

7. **Nerfed Bots** (Practice)
   - 6 easy bots, 10 min
   - Training mode
   - Win: 50 kills
   - Unlimited ammo

8. **Survival Mode**
   - 6+ scaling bots, endless
   - Bots get harder over time
   - Health regen enabled
   - Test your endurance

### Map System (`map.ts`)
**Dust II Recreation:**
- Ground plane (200x200m)
- Strategic cover points
- Wall structures (A/B sites)
- Pillars for cover
- Boundary walls (keep players in)
- Sky dome
- Dynamic lighting
- 8 bot spawn points positioned for variety
- Player spawn at center

**Features:**
- Ground physics & collision
- Multiple sightlines
- Close quarters + long range areas
- Elevated positions
- Natural cover for strategy

---

## 🎨 User Interface

### Main Menu
- Gamemode grid selector (8 options)
- Difficulty buttons (Easy/Medium/Hard/Expert)
- Beautiful gradient background
- Clean, modern design

### In-Game HUD
- **Top Bar:** Gamemode name, timer, FPS counter
- **Score Display:** Kills, accuracy %, headshots
- **Kill Feed:** Real-time elimination log
- **Crosshair:** Dynamic, centered, color-coded
- **Scope:** Sniper scope overlay (AWP only)
- **Health Block:** HP bar, armor display
- **Ammo Counter:** Magazine/reserve ammo
- **Controls Help:** Built into pause menu

### Pause Menu
- Resume/Restart/Home buttons
- Sensitivity adjustment slider
- Volume control slider
- Controls legend (all keybinds)
- Weapon balance disclaimer

---

## 🔧 Technical Stack

### Frontend
- **Three.js r185** - 3D rendering
- **TypeScript** - Type-safe code
- **Vite** - Fast bundler & dev server
- **HTML5 Canvas** - Game rendering
- **CSS3** - Styling & animations

### Physics
- Manual gravity implementation
- Collision detection (ground)
- Velocity-based movement
- Jump mechanics
- Crouch height adjustment

### Audio (Ready for Implementation)
- Placeholder volume slider
- Gun sounds (to implement)
- Hit/miss feedback
- Reload audio

---

## 📊 Game Stats Tracked

Per session:
- Total kills
- Kill/death ratio
- Headshot count
- Accuracy percentage (hits/shots)
- Damage dealt
- Damage taken
- Win/loss record
- Time played
- Rounds completed

---

## 🚀 Performance Optimizations

- **Efficient Rendering:** Frustum culling, LOD
- **Physics:** Simplified ground collision
- **Bot AI:** Lightweight state machine
- **Memory:** Proper cleanup on dispose
- **Shadows:** Optional, can be disabled
- **Fog:** Distance-based rendering limit
- **Draw Calls:** Batched mesh rendering

**Target Performance:**
- 60 FPS on mid-range machines
- Scales from 1440p down to 720p
- Works on 4+ year old hardware

---

## 🔌 Extensibility

### Easy to Add

1. **New Weapon**
   - Add entry to `WEAPONS_DATABASE`
   - 5-minute implementation

2. **New Gamemode**
   - Create entry in `GAMEMODES`
   - Configure parameters
   - 10-minute implementation

3. **New Difficulty**
   - Add preset to `DIFFICULTY_PRESETS`
   - Adjust accuracy/reaction/range values

4. **New Map**
   - Extend `Map` class
   - Implement `buildMap()` method
   - Add spawn points

5. **Bot Behavior**
   - Modify `update()` in Bot class
   - Add new decision trees
   - Implement pathing

---

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core game engine
- ✅ Player controller
- ✅ Bot AI (4 difficulties)
- ✅ 10 weapons with CS2 data
- ✅ 8 gamemodes
- ✅ Dust II map
- ✅ HUD & menus

### Phase 2 (Next)
- [ ] Advanced bot pathfinding (A*)
- [ ] Multiple maps (Mirage, Inferno)
- [ ] Economy system
- [ ] Bomb/defuse mechanics
- [ ] Team objective modes

### Phase 3 (Later)
- [ ] Custom map editor
- [ ] Replay system
- [ ] Leaderboards
- [ ] Skin system
- [ ] Mobile support
- [ ] Tauri desktop wrapper

### Phase 4 (Future)
- [ ] Network multiplayer (WebRTC)
- [ ] More weapon variants
- [ ] Voice comms
- [ ] Clan system
- [ ] Ranked seasons

---

## 🐛 Known Limitations

1. **Pathfinding** - Bots walk in straight lines (no obstacles)
2. **One Map** - Only Dust II implemented
3. **Economics** - No buy system or money
4. **Objectives** - No bomb plant/defuse yet
5. **Multiplayer** - Single-player only
6. **Graphics** - Basic textures, no skins yet

---

## 💡 Design Principles

1. **Offline First** - Works completely without internet
2. **Performance** - Runs smooth on older hardware
3. **Modularity** - Easy to extend and modify
4. **Accessibility** - Keyboard + mouse only
5. **Fairness** - Bot nerfs are adjustable
6. **Customization** - Every setting is tweakable

---

## 🎯 Use Cases

1. **Aim Training** - Practice crosshair placement
2. **Spray Learning** - Master recoil patterns
3. **Off-Season** - Play when main game is down
4. **Teaching** - Learn CS mechanics
5. **Modding** - Extend with custom content
6. **Development** - Reference implementation
7. **Casual Fun** - Just play and relax

---

## 📝 Code Quality

- **TypeScript** - Full type safety
- **Modular** - Clean separation of concerns
- **Well-Commented** - Clear explanations
- **Consistent** - Uniform coding style
- **DRY Principle** - No unnecessary duplication
- **Performance** - Optimized hot paths

---

**Total Lines of Code:** ~1,550 (TypeScript) + 400 (HTML/CSS)

**Build Size:** ~5 MB (with Three.js)

**Uncompressed:** ~15 MB

**Compressed:** ~3-4 MB (gzip)

---

Ready to extend and customize! 🚀
