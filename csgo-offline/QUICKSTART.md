# Quick Start Guide

## 🚀 Run It Right Now (No Installation)

### Mac/Linux:
```bash
# Navigate to the project folder
cd csgo-offline

# Start a local server (Python 3)
python3 -m http.server 8080

# Open in browser
# Visit: http://localhost:8080
```

### Windows:
```bash
# Using Node.js (if installed)
npx http-server . -p 8080

# Or use Python (if installed)
python -m http.server 8080

# Then open: http://localhost:8080
```

### Or Just Double-Click
1. Download/extract the project
2. Open `index.html` directly in your browser
3. Click "Click here to start" if nothing appears

---

## ⚙️ For Development (Optional)

If you want to modify the game:

```bash
# Install Node.js from nodejs.org if you don't have it

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# This opens http://localhost:5173 automatically
# Changes to files update instantly
```

---

## 🎮 First Game

1. **Select Difficulty** - Start with "Easy"
2. **Pick Game Mode** - Try "Free-For-All" for casual play
3. **Click "START GAME"**
4. **Click the game canvas** to unlock mouse control
5. **Play!**

---

## 📋 Game Modes Quick Breakdown

| Mode | Best For | Bots |
|------|----------|------|
| **Free-For-All** | Casual aim training | 4 |
| **Team Deathmatch** | Squad practice | 4 (2v2) |
| **Gun Game** | Weapon progression | 3 |
| **Aim Arena** | Pure aim | 8 |
| **Weapon Mastery** | Learn each gun | 4 |
| **Spray Control** | Recoil patterns | 1 |
| **Nerfed Bots** | Easy practice | 6 |
| **Survival Mode** | Endless challenge | 6+ |

---

## 🎮 Basic Controls

| Action | Key |
|--------|-----|
| Move | W, A, S, D |
| Jump | SPACE |
| Sprint | SHIFT |
| Crouch | CTRL or C |
| Shoot | Left Mouse Click |
| Scope/Melee | Right Mouse Click |
| Switch Weapon | 1, 2, 3 or Scroll |
| Reload | R |
| Pause | ESC |

---

## 📍 Tips for New Players

1. **Start with Easy bots** - Get comfortable with controls first
2. **Use spray control drills** - Practice the AK/M4 spray pattern
3. **Try Weapon Mastery** - Learn each weapon's strengths
4. **Adjust sensitivity** - Open pause menu to tweak mouse feel
5. **Use cover** - Don't run in open, crouch behind boxes
6. **Aim for headshots** - 2x damage multiplier vs body shots
7. **Watch your ammo** - Press R to reload frequently

---

## 🔧 Customization

### Change Bot Difficulty
Open `src/bot.ts` and find `DIFFICULTY_PRESETS`. Modify values like:
- `aimAccuracy`: 0 (miss all) to 1 (perfect aim)
- `reactionTime`: seconds before bots react
- `headShotChance`: 0 to 1 probability

### Add More Bots
In `src/gamemodes.ts`, change `botCount` in any gamemode.

### Tweak Weapon Damage
In `src/weapons.ts`, modify the `damage` value in `WEAPONS_DATABASE`.

### Create Custom Gamemode
Copy an existing one in `src/gamemodes.ts` and change the values.

---

## ❓ Common Questions

**Q: Can I play with friends?**
A: Not yet - local practice only. Multiplayer is on the roadmap.

**Q: Is it free?**
A: Yes! MIT license - completely open source.

**Q: Can I use this offline?**
A: Yes! Works completely offline after first load.

**Q: Will you add more maps?**
A: Yes - Mirage and Inferno are planned. Contributions welcome!

**Q: How do I improve my aim?**
A: Play Aim Arena or Spray Control mode repeatedly. Focus on clicking heads.

**Q: Can I export stats?**
A: Coming soon. Currently stats are tracked in-game only.

---

## 🐛 Having Issues?

**Game won't load?**
- Try refreshing (Ctrl+R or Cmd+R)
- Try a different browser (Chrome/Edge work best)
- Check console for errors (F12 → Console)

**Bots seem stuck?**
- They'll eventually move - they patrol slowly
- Click and shoot to engage them

**Mouse sensitivity feels wrong?**
- Pause menu → adjust "CS sensitivity" slider
- Default is 1.0 (neutral)

**FPS is low?**
- Reduce bot count in gamemode selection
- Close other browser tabs
- Lower your monitor resolution

---

## 🚀 Next Steps

1. **Play a few rounds** to get comfortable
2. **Try different difficulties** progressively
3. **Experiment with weapons** - find your favorite
4. **Look at the code** - it's all in `src/` folder
5. **Make modifications** - extend weapons, gamemodes, etc.

---

**Enjoy! 🎮**

Questions? Check the full README.md for advanced config options.
