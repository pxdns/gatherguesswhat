# Counter-Strike Offline Practice Arena

A fully offline, browser-based Counter-Strike practice arena with bot AI, multiple weapons, gamemodes, and proper CS2 mechanics. No internet required. Works on Mac, Windows, and Linux.

## Features

### ✅ Game Modes
- **Free-For-All** - Classic FFA with up to 8 bots
- **Team Deathmatch** - Team-based combat with respawns
- **Gun Game** - Progress through all weapon types
- **Aim Arena** - High bot density for pure aim training
- **Weapon Mastery** - Focus on specific weapon types
- **Spray Control** - 1v1 against expert bot
- **Nerfed Bots** - Practice against easier opponents
- **Survival Mode** - Endless waves of increasingly tough bots

### 🤖 Bot AI System
**4 Difficulty Levels:**
- **Easy** - 0.4 accuracy, 1.0s reaction time, basic movement
- **Medium** - 0.7 accuracy, 0.5s reaction time, intelligent positioning
- **Hard** - 0.85 accuracy, 0.2s reaction time, tactical play
- **Expert** - 0.95 accuracy, 0.05s reaction time, nearly unbeatable

Bot behaviors:
- Line-of-sight awareness
- Reaction time based on difficulty
- Intelligent target selection
- Movement prediction
- Aim compensation for distance
- Headshot prediction (scales with difficulty)

### 🔫 Weapons (10 Types)
**Rifles:**
- AK-47 (31 damage, 10 rpm, 65% accuracy)
- M4A1 (21 damage, 13.33 rpm, 80% accuracy)

**Sniper Rifles:**
- AWP Dragon Lore (115 damage, 1.15 rpm, 98% accuracy, scoped)

**Pistols:**
- Desert Eagle (63 damage, 1.5 rpm, 81% accuracy)
- Glock-18 (18 damage, 15 rpm, 50% accuracy)

**SMGs:**
- MP5-SD (25 damage, 15 rpm, 65% accuracy)
- UMP-45 (35 damage, 9.1 rpm, 70% accuracy)

**Shotguns:**
- XM1014 (20 damage, 2.25 rpm, 40% accuracy)
- Nova (26 damage, 1.5 rpm, 30% accuracy)

**Melee:**
- Knife (40 damage, 2m range)

**Weapon Mechanics:**
- Recoil patterns (weapon-specific)
- Armor penetration values
- Damage falloff over distance
- Ammo management
- Reload times
- Scoped weapons (AWP)
- Burst vs full-auto firing modes

### 🎮 Player Mechanics
- **Movement** - WASD for move, SHIFT to sprint, CTRL/C to crouch
- **Combat** - Left-click to fire, right-click for scope/melee
- **Weapons** - 1/2/3 to switch, Scroll wheel for quick swap
- **Health System** - 100 HP, armor protection, damage scaling
- **Inventory** - Primary rifle, secondary pistol, knife
- **Reloading** - R key, time-scaled by weapon
- **Inspection** - F key to inspect weapon (cosmetic)
- **Sensitivity** - Adjustable in pause menu

### 📊 Stats Tracking
- Kill count
- Headshot count
- Accuracy percentage (hits/shots)
- Deaths
- Damage dealt
- Damage taken

### 🗺️ Map
**Dust II Recreation:**
- 3D environment with cover points
- Multiple sightlines
- Open and closed areas
- Bot spawn points strategically placed
- Ground physics and collision
- Realistic lighting

### ⚙️ Technical Features
- **No Dependencies** - Works offline, minimal dependencies
- **Three.js Rendering** - Full 3D environment
- **Physics** - Gravity, collision, jumping, crouching
- **Raycasting** - Accurate hit detection
- **Performance** - Optimized for 60+ FPS on modern hardware
- **Responsive** - Auto-scales to window size
- **Cross-platform** - Works on Mac, Windows, Linux

## Setup

### Option 1: Direct Browser (Fastest)
```bash
# Just open the HTML file in your browser
# Works offline completely

# Or run a simple local server
npx http-server . -p 8080
# Then visit http://localhost:8080
```

### Option 2: Development Setup (TypeScript)
```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build
npm run build
```

### Option 3: Tauri Desktop App (Coming Soon)
For a native desktop app wrapper with auto-updates.

## Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move |
| **SPACE** | Jump |
| **SHIFT** | Sprint |
| **CTRL / C** | Crouch |
| **MOUSE** | Look around (move mouse) |
| **LEFT CLICK** | Fire weapon |
| **RIGHT CLICK** | Scope / Alt-fire / Melee |
| **1 / 2 / 3** | Switch weapon |
| **SCROLL** | Cycle weapons |
| **R** | Reload |
| **Q** | Last weapon |
| **F** | Inspect weapon |
| **ESC** | Pause menu |

## Config

Edit these files to customize:

### `src/bot.ts`
- Bot difficulty presets
- Reaction times
- Aim accuracy
- Headshot chances
- Detection ranges

### `src/weapons.ts`
- Weapon damage values
- Fire rates
- Accuracy
- Recoil patterns
- Magazine sizes

### `src/gamemodes.ts`
- Gamemode parameters
- Bot counts
- Round times
- Win conditions
- Health regen settings

### `src/map.ts`
- Map layout
- Spawn points
- Lighting
- Cover points

## Extending the Game

### Add a New Weapon
```typescript
// In src/weapons.ts
WEAPONS_DATABASE['ak47v2'] = {
  name: 'AK-47 Variant',
  type: 'rifle',
  damage: 32,
  fireRate: 10,
  accuracy: 0.65,
  // ... other properties
};
```

### Add a New Gamemode
```typescript
// In src/gamemodes.ts
GAMEMODES['myMode'] = {
  name: 'My Custom Mode',
  botCount: 4,
  roundTime: 300,
  // ... other properties
};
```

### Adjust Bot Difficulty
```typescript
// In src/bot.ts
DIFFICULTY_PRESETS['insane'] = {
  reactionTime: 0.01,
  aimAccuracy: 0.99,
  headShotChance: 0.9,
  // ... other properties
};
```

### Replace Map
Create a new class extending `Map` and customize the 3D environment in `buildDustII()`.

## Performance Tips

1. **Lower Bot Count** - Fewer bots = higher FPS
2. **Reduce Draw Distance** - Adjust fog in `game.ts`
3. **Lower Resolution** - Run at 720p instead of 1440p
4. **Disable Shadows** - Remove shadow mapping if needed
5. **Close Other Tabs** - Frees up CPU/GPU

## Known Limitations

- Bots don't yet have complex pathfinding (they move in lines)
- No economy system (money, buy rounds)
- No bomb/defuse mechanics
- Map is single environment (Dust II only currently)
- No multiplayer (local only)
- Weapon inspect is visual only

## Future Roadmap

- [ ] Multiple maps (Mirage, Inferno, etc.)
- [ ] Advanced bot pathfinding (A*)
- [ ] Economy system and buy rounds
- [ ] Bomb planting / defusing
- [ ] Team-based objectives
- [ ] Custom map editor
- [ ] Replay system
- [ ] Leaderboards
- [ ] Weapon skins
- [ ] Tauri desktop wrapper
- [ ] Mobile support (touch controls)
- [ ] Network multiplayer (WebRTC)

## Troubleshooting

**Game won't start:**
- Make sure JavaScript is enabled
- Check browser console for errors (F12)
- Try a different browser

**Low FPS:**
- Lower bot count in gamemode settings
- Close other browser tabs
- Try Edge or Chrome (better WebGL support)

**Bots seem too easy/hard:**
- Adjust difficulty in main menu
- Edit difficulty presets in `src/bot.ts`

**Mouse not working:**
- Click on the canvas to enable pointer lock
- Check browser settings for pointer lock permission

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Any WebGL 2.0 capable browser

## License

MIT - Free to use and modify

## Credits

Built with Three.js and inspired by Counter-Strike 2 mechanics. Uses published weapon data from official sources.

---

**Want to contribute?** Feel free to extend weapons, gamemodes, bot AI, or maps! The modular architecture makes it easy to add new features.
