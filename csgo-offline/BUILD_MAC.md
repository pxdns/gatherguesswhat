# 🍎 Build Mac Binary (.app / .dmg)

This guide will create a native Mac application that runs completely offline.

## Prerequisites

### 1. Install Rust (Required)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

### 2. Install Xcode Command Line Tools
```bash
xcode-select --install
```

### 3. Install Node.js (if not already)
```bash
# Download from https://nodejs.org (LTS recommended)
# Or use Homebrew:
brew install node
```

### 4. Verify Installation
```bash
node --version    # Should be 16+
npm --version     # Should be 7+
cargo --version   # Should exist
rustc --version   # Should exist
```

---

## Build Steps

### Step 1: Navigate to Project
```bash
cd /home/claude/csgo-offline
# Or wherever you downloaded it
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Web App (Required First)
```bash
npm run build
```
This creates the `dist/` folder that Tauri will package.

### Step 4: Build Mac Binary
```bash
# Build universal binary (Apple Silicon + Intel)
npm run tauri:build:mac

# OR build for current architecture only (faster)
npm run tauri:build
```

**First build takes 10-15 minutes** (Tauri downloads dependencies).
Subsequent builds are faster (~2-5 minutes).

---

## Output Files

After building, you'll find:

### Universal Binary (Intel + Apple Silicon)
```
src-tauri/target/universal-apple-darwin/release/CS Offline.app
src-tauri/target/universal-apple-darwin/release/CS Offline.dmg
```

### Intel Only (M1/M2 Macs need `aarch64`)
```
src-tauri/target/release/CS Offline.app
src-tauri/target/release/CS Offline.dmg
```

---

## Use the App

### Option 1: Run .app Directly
```bash
open "src-tauri/target/universal-apple-darwin/release/CS Offline.app"
```

### Option 2: Install from .dmg
1. Find `CS Offline.dmg` in the build output folder
2. Double-click to mount
3. Drag "CS Offline" to Applications folder
4. Launch from Applications

### Option 3: Keep as Portable
- Copy the `.app` folder anywhere
- Double-click to run
- No installation needed

---

## Distribute the App

### For Friends (Easy)
```bash
# Just send them the .dmg file
# They can:
# 1. Double-click to mount
# 2. Drag to Applications
# 3. Launch
```

### For Public Distribution
- Sign the .app with your Apple Developer certificate (optional but recommended)
- Notarize for Gatekeeper (Apple's security - free but requires Apple Developer account)

---

## Troubleshooting

### Error: "Cannot find Xcode"
```bash
xcode-select --install
# Then try building again
```

### Error: "Rust not found"
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### Error: "No such file or directory: dist"
```bash
# You need to build the web app first
npm run build

# Then try Tauri build again
npm run tauri:build:mac
```

### Slow Build / Out of Memory
```bash
# Build with reduced parallelism
cd src-tauri
cargo build --release -j 2
cd ..
```

### Binary Won't Launch
1. Check System Preferences → Security & Privacy
2. Click "Open Anyway" if prompted
3. Ensure it's the correct architecture for your Mac

### Check Binary Architecture
```bash
# See what the .app is compiled for
file "src-tauri/target/universal-apple-darwin/release/CS Offline.app/Contents/MacOS/CS Offline"

# Should show: Mach-O universal binary with 2 architectures: [x86_64:Mach-O 64-bit executable x86_64] [arm64e]
```

---

## Build System

### What Tauri Does
1. Compiles your TypeScript/Web code (via Vite)
2. Packages it into a web bundle
3. Wraps it with a native Rust shell
4. Creates `.app` (Mac executable)
5. Creates `.dmg` (Mac installer disk image)

### Build Artifacts
- `CS Offline.app/` - Native app executable (~50 MB)
- `CS Offline.dmg` - Installer for distribution (~30 MB)

### Included in Binary
✅ Full game engine
✅ All 10 weapons
✅ All 8 game modes
✅ Bot AI
✅ 3D environment
✅ Everything offline

### NOT Included (Internet Only)
❌ Dependencies loaded from CDN (you specify local Three.js)

---

## Production Release Build

### Optimize for Size
```bash
# Edit src-tauri/tauri.conf.json:
# Change "frontendDist": "../dist"
# Ensure npm run build was run with minification

npm run build  # Minifies everything
npm run tauri:build:mac
```

### Create Release Notes
Create `RELEASE.md`:
```markdown
# CS Offline v1.0.0

## Changes
- Initial release
- 8 game modes
- 10 weapons
- 4 difficulty levels
- Offline gameplay

## Installation
1. Download CS_Offline.dmg
2. Double-click to mount
3. Drag to Applications
4. Launch from Applications folder

## System Requirements
- macOS 10.13+
- 200 MB free disk space
- Modern Mac recommended (2015+)
```

---

## Cross-Platform

Once working on Mac, building for other platforms:

### Build for Windows
```bash
npm run tauri:build -- --target x86_64-pc-windows-msvc
```
Requires: Windows or cross-compilation setup

### Build for Linux
```bash
npm run tauri:build -- --target x86_64-unknown-linux-gnu
```
Requires: Linux or cross-compilation

---

## Advanced: Signing & Notarization

### Sign the App (Optional)
```bash
# Requires Apple Developer Certificate
codesign --deep --force --verify --verbose --sign "Developer ID Application" \
  "src-tauri/target/universal-apple-darwin/release/CS Offline.app"
```

### Notarize (Apple Gatekeeper Security)
Recommended for public distribution:
1. Upload to Apple
2. Get notarization ticket
3. Staple to .app
4. Create new .dmg

(Requires free Apple Developer account)

---

## Fast Development Cycle

During development, use:
```bash
npm run tauri:dev
```

This:
- Watches source files
- Hot-reloads the app
- Keeps Rust compilation separate
- ~5 second refresh on changes

Great for testing UI changes!

---

## Tips & Tricks

### Smaller File Size
- Check `tauri.conf.json` for unused permissions
- Remove unused Tauri features
- Minify all assets

### Faster Builds
```bash
# Clear cache
rm -rf src-tauri/target

# Use release mode (slower build, faster app)
npm run tauri:build

# Use debug mode (faster build, slower app)
npm run tauri:dev
```

### Multiple Versions
```bash
# Update version in src-tauri/tauri.conf.json
# Then build with that version
npm run tauri:build:mac
```

---

## Summary

### Build Command (TL;DR)
```bash
npm install              # Once
npm run build           # Every build
npm run tauri:build:mac # Creates Mac binary
```

### Output
- `src-tauri/target/universal-apple-darwin/release/CS Offline.dmg` - Ready to share!

### Time
- First build: 15 min
- Subsequent: 2-5 min
- Launch: Instant (no internet needed)

---

**Enjoy your native Mac app! 🍎**

Questions? Check Tauri docs: https://tauri.app/
