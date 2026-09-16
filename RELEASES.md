# 🚀 Nexa - Release Instructions

Complete guide to building and releasing Nexa desktop app bundles.

## Auto-Release with GitHub Actions

### How It Works

1. Create a git tag: `git tag v1.0.0`
2. Push to GitHub: `git push origin v1.0.0`
3. GitHub Actions automatically:
   - Builds for Windows (.msi)
   - Builds for macOS Intel (.dmg)
   - Builds for macOS ARM64 (.dmg)
   - Builds for Linux (.AppImage + .deb)
   - Creates GitHub Release
   - Uploads all binaries

### Create a Release

```bash
# 1. Commit your changes
git add .
git commit -m "release: version 1.0.0"

# 2. Create version tag
git tag v1.0.0

# 3. Push to trigger workflows
git push origin main --tags

# 4. Watch GitHub Actions
# Go to: https://github.com/pxdns/gatherguesswhat/actions
# Release workflow should start automatically
```

### Release Naming Convention

Use semantic versioning:
- `v1.0.0` - Major release
- `v1.0.1` - Patch release
- `v1.1.0` - Minor release
- `v2.0.0-beta` - Beta release

---

## Manual Build (Local)

If GitHub Actions doesn't work or you need to build locally:

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install system dependencies (Linux)
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev \
  libappindicator3-dev librsvg2-dev patchelf

# Install system dependencies (macOS)
brew install gtk3 webkit2gtk

# Install system dependencies (Windows)
# Download from: https://visualstudio.microsoft.com/downloads/
# Install "Desktop development with C++"
```

### Build Steps

```bash
# Install dependencies
npm install

# Build web app first
npm run build:web

# Build desktop app (all platforms)
npm run build:all

# Or build specific platform
npm run build:win      # Windows (.msi)
npm run build:macos    # macOS Intel (.dmg)
npm run build:macos-arm # macOS ARM64 (.dmg)
npm run build:linux    # Linux (.AppImage + .deb)
```

### Output Locations

After building, binaries are at:

```
Windows (*.msi):
apps/desktop/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/

macOS Intel (*.dmg):
apps/desktop/src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/

macOS ARM64 (*.dmg):
apps/desktop/src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/

Linux (*.AppImage):
apps/desktop/src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/

Linux (*.deb):
apps/desktop/src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/
```

---

## GitHub Secrets (For Auto-Release)

To enable GitHub Actions to build and sign releases, add these secrets to your repo:

### Required (Basic Build)
No secrets required! GitHub Actions will build unsigned binaries.

### Optional (Code Signing)

For production releases with code signing:

#### macOS Signing
```
APPLE_CERTIFICATE      - Your Apple Developer certificate (.p8 format)
APPLE_CERTIFICATE_PASSWORD - Certificate password
APPLE_SIGNING_IDENTITY - Your signing identity (e.g., "Developer ID Application: ...")
APPLE_ID              - Your Apple ID email
APPLE_PASSWORD        - App-specific password (not your real password!)
APPLE_TEAM_ID         - Your Apple Team ID
```

#### Windows Signing
```
WINDOWS_CERTIFICATE   - Your Windows code signing certificate
WINDOWS_CERTIFICATE_PASSWORD - Certificate password
```

To add secrets:
1. Go to repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret

---

## Troubleshooting Build Failures

### "Build failed on Windows"
- Ensure Visual Studio Build Tools are installed
- Check that Rust toolchain includes `x86_64-pc-windows-msvc`

### "Build failed on macOS"
- Update Rust: `rustup update`
- Clear Xcode cache: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### "Build failed on Linux"
- Install all system dependencies
- Run: `cargo clean` then rebuild

### GitHub Actions Timeout
- Some platforms take 30-45 minutes to build
- Check workflow logs: Actions → Release Nexa Desktop

---

## Distribute Releases

After GitHub Actions completes:

1. **GitHub Releases**
   - Automatic: https://github.com/pxdns/gatherguesswhat/releases
   - All binaries uploaded automatically

2. **Create Release Notes**
   - Go to Release → Edit
   - Add changelog
   - Publish

3. **Distribute Elsewhere**
   - Windows: Microsoft Store (optional)
   - macOS: Mac App Store (optional)
   - Linux: Ubuntu/Fedora repositories (optional)

---

## Version Checklist

Before each release:

- [ ] Update version in `package.json`
- [ ] Update version in `apps/desktop/src-tauri/tauri.conf.json`
- [ ] Update `CHANGELOG.md` (if you have one)
- [ ] Run local tests: `npm test`
- [ ] Build locally to verify
- [ ] Create git tag
- [ ] Push to GitHub
- [ ] Verify GitHub Actions runs
- [ ] Verify binaries download

---

## Example Release Workflow

```bash
# 1. Make changes, test locally
npm run dev:web

# 2. Stage changes
git add -A

# 3. Commit with version bump
git commit -m "release: v1.0.0

- Add messaging feature
- Fix authentication bug
- Improve UI performance"

# 4. Create version tag
git tag v1.0.0

# 5. Push everything
git push origin main
git push origin v1.0.0

# 6. Monitor GitHub Actions
# https://github.com/pxdns/gatherguesswhat/actions

# 7. Download from GitHub Releases
# https://github.com/pxdns/gatherguesswhat/releases/tag/v1.0.0
```

---

## FAQ

**Q: How do I skip a release?**
A: Just don't push tags. Tags trigger releases.

**Q: Can I build just Windows?**
A: Yes, push a tag and GitHub Actions builds all platforms. Local: `npm run build:win`

**Q: What if code signing fails?**
A: Build still succeeds, but binaries are unsigned. Fine for testing.

**Q: How do I publish to App Stores?**
A: After release, manually submit .dmg (Mac), .msi (Windows), .AppImage (Linux) to store.

---

**All releases are automatic!** Just push a tag. 🚀
