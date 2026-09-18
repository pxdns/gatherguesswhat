# 📁 Where Are My Files?

All your game files are here:

```
/home/claude/csgo-offline/
```

## 📂 Complete File Structure

```
csgo-offline/
│
├── 📄 index.html                 ← Main game UI (open this in browser)
├── 📄 build-mac.sh              ← ONE COMMAND to build Mac binary ⭐
├── 📄 BUILD_MAC.md              ← Full Mac build instructions
├── 📄 START_HERE.md             ← Read this first
├── 📄 QUICKSTART.md             ← Quick setup guide
├── 📄 README.md                 ← Full documentation
├── 📄 PROJECT_STRUCTURE.md      ← Technical details
├── 📄 WHERE_ARE_FILES.md        ← This file
│
├── 📁 src/                      ← Game source code (TypeScript)
│   ├── game.ts                  ← Game engine (400 lines)
│   ├── player.ts                ← Player controller (350 lines)
│   ├── bot.ts                   ← Bot AI (300 lines)
│   ├── weapons.ts               ← Weapon system (250 lines)
│   ├── gamemodes.ts             ← Game modes (100 lines)
│   └── map.ts                   ← Dust II map (150 lines)
│
├── 📁 src-tauri/                ← Mac app wrapper (Tauri)
│   ├── tauri.conf.json          ← App configuration
│   ├── Cargo.toml               ← Rust dependencies
│   ├── build.rs                 ← Build script
│   └── src/
│       └── main.rs              ← Tauri entry point
│
└── Config files:
    ├── package.json             ← NPM dependencies
    ├── tsconfig.json            ← TypeScript settings
    ├── vite.config.ts           ← Build configuration
    └── .gitignore               ← Git ignore rules
```

---

## 🎮 Game File Breakdown

### Main Game (TypeScript - /src/)
- **game.ts** (400 lines)
  - Game loop
  - State management
  - HUD updates
  
- **player.ts** (350 lines)
  - First-person controller
  - Movement & jumping
  - Weapon firing
  
- **bot.ts** (300 lines)
  - Enemy AI
  - 4 difficulty levels
  - Aiming & targeting
  
- **weapons.ts** (250 lines)
  - 10 weapons database
  - Recoil system
  - Damage calculation
  
- **gamemodes.ts** (100 lines)
  - 8 game modes
  - Mode configuration
  
- **map.ts** (150 lines)
  - Dust II 3D environment
  - Spawn points
  - Collision

### UI File
- **index.html** (18 KB)
  - Menu system
  - HUD display
  - Game canvas
  - Controls

### Mac App Wrapper (/src-tauri/)
- **tauri.conf.json**
  - App name, version, window size
  
- **Cargo.toml**
  - Rust/Tauri dependencies
  
- **main.rs**
  - Tauri window initialization

---

## 🚀 BUILD MAC BINARY - 3 STEPS

### Prerequisites (One Time)
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust (if not already)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Install Node.js targets
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

### Then: Just Run This
```bash
cd /home/claude/csgo-offline
bash build-mac.sh
```

That's it! One command builds everything.

### Output
```
src-tauri/target/universal-apple-darwin/release/
├── CS Offline.app        ← Native Mac app (can run directly)
└── CS Offline.dmg        ← Installer (for sharing with friends)
```

---

## 📥 What You'll Get

### CS Offline.app (100 MB)
- Native Mac executable
- Double-click to run
- No installation needed
- Works offline completely

### CS Offline.dmg (30 MB)
- Mac installer disk image
- Looks professional
- Easy to share
- Friends can drag to Applications

---

## 🎮 Run It

### Option 1: After Build (Immediate)
```bash
open "src-tauri/target/universal-apple-darwin/release/CS Offline.app"
```

### Option 2: From Finder
1. Find the `.app` file
2. Double-click it
3. Play!

### Option 3: Install from .dmg
1. Double-click `CS Offline.dmg`
2. Drag app to Applications
3. Launch from Applications folder

---

## ✏️ Edit Game Files

All game files are in `/src/`:

### Change Weapon Damage
```
/src/weapons.ts
→ Line 16: Change "damage: 31"
```

### Adjust Bot Difficulty
```
/src/bot.ts
→ Line 20: DIFFICULTY_PRESETS
→ Change "aimAccuracy: 0.4"
```

### Add Game Mode
```
/src/gamemodes.ts
→ Line 80: Add new GAMEMODES entry
```

### Customize Map
```
/src/map.ts
→ Change buildDustII() function
```

After editing, rebuild:
```bash
npm run build
npm run tauri:build:mac
```

---

## 📊 File Sizes

| File | Size |
|------|------|
| src/game.ts | 12 KB |
| src/player.ts | 11 KB |
| src/bot.ts | 9 KB |
| src/weapons.ts | 8 KB |
| src/gamemodes.ts | 3 KB |
| src/map.ts | 5 KB |
| index.html | 18 KB |
| **Total Source** | **66 KB** |
| Built .app | 100 MB (includes Three.js) |
| Installer .dmg | 30 MB (compressed) |

---

## 🔧 Build System

### Development (Quick Testing)
```bash
npm run dev
# Runs at http://localhost:5173
# Hot reload on changes
```

### Web Build (For browser)
```bash
npm run build
# Creates dist/ folder
# ~300 KB minified
```

### Mac Build (For .app/.dmg)
```bash
npm run tauri:build:mac
# Creates native Mac binary
# First time: 15 minutes
# Subsequent: 2-5 minutes
```

---

## 📦 Dependencies

### NPM (JavaScript)
```json
{
  "three": "^r185",           // 3D rendering
  "@tauri-apps/cli": "^1.5",  // Mac builder
  "@tauri-apps/api": "^1.5",  // Mac APIs
  "vite": "^5.0.7",           // Web bundler
  "typescript": "^5.3.3"      // Type checking
}
```

### Cargo (Rust)
```toml
tauri = "1.5"  // Native Mac shell
```

---

## 🚀 Timeline

### First Time Setup
- Install Rust: 5 min
- Install Xcode tools: 10 min
- `npm install`: 2 min
- First `npm run build`: 1 min
- First `npm run tauri:build:mac`: 15 min
- **Total: ~35 minutes**

### Subsequent Builds
- `npm run build`: 1 min
- `npm run tauri:build:mac`: 3 min
- **Total: ~4 minutes**

---

## ✅ Verification

### Check Prerequisites
```bash
node --version     # Should be 16+
npm --version      # Should be 7+
cargo --version    # Should exist
rustc --version    # Should exist
xcode-select -p    # Should output path
```

### Check Files Exist
```bash
ls -la /home/claude/csgo-offline/src/
# Should show: bot.ts game.ts gamemodes.ts map.ts player.ts weapons.ts

ls -la /home/claude/csgo-offline/src-tauri/
# Should show: Cargo.toml build.rs tauri.conf.json src/

ls -la /home/claude/csgo-offline/*.sh
# Should show: build-mac.sh
```

---

## 🎯 Quick Reference

| Goal | Command | Location |
|------|---------|----------|
| Run in browser | `python3 -m http.server 8080` | http://localhost:8080 |
| Dev with hot reload | `npm run dev` | http://localhost:5173 |
| Build web app | `npm run build` | → `dist/` folder |
| Build Mac binary | `bash build-mac.sh` | → `src-tauri/target/...` |
| Build manually | `npm run tauri:build:mac` | → `src-tauri/target/...` |
| Launch .app | `open src-tauri/...CS\ Offline.app` | Runs native app |

---

## 🆘 Troubleshooting

### Files Not Found?
Make sure you're in the right directory:
```bash
cd /home/claude/csgo-offline
pwd  # Should show: /home/claude/csgo-offline
ls -la  # Should show all these files
```

### Can't Run build-mac.sh?
```bash
chmod +x build-mac.sh
bash build-mac.sh
```

### npm install fails?
```bash
npm cache clean --force
rm package-lock.json
npm install
```

### Cargo build fails?
```bash
rustup update
npm run build  # Rebuild web app first
npm run tauri:build:mac
```

---

## 📚 Documentation Map

1. **WHERE_ARE_FILES.md** ← You are here
2. **START_HERE.md** - Quick overview
3. **BUILD_MAC.md** - Detailed Mac instructions
4. **QUICKSTART.md** - Setup & controls
5. **README.md** - Full documentation
6. **PROJECT_STRUCTURE.md** - Technical deep-dive

---

## 🎮 Next Steps

### Right Now (2 steps)
1. ✅ Read **START_HERE.md**
2. ✅ Run the game: `python3 -m http.server 8080`

### Next (Build Mac Binary)
1. ✅ Install prerequisites
2. ✅ Run: `bash build-mac.sh`
3. ✅ Find `.app` in build output
4. ✅ Run it! 🚀

### Later (Customize)
1. Edit files in `src/`
2. Rebuild: `npm run build && npm run tauri:build:mac`
3. Test in `.app`

---

**Everything you need is here. Happy coding! 🍎🎮**
