# Nexa Setup Guide

Complete setup instructions for Nexa - the production communication platform.

## ✅ What's Already Done

Your Nexa codebase is **fully initialized** with:

- ✅ Monorepo structure (apps + packages)
- ✅ Next.js web app (port 3000)
- ✅ Next.js marketing site (port 3001)
- ✅ Tauri desktop app (Windows, Linux, macOS - both x86_64 & ARM64)
- ✅ PostgreSQL database schema (Prisma)
- ✅ Branding system (centralized config)
- ✅ Theme engine (Light, Dark, multiple variants)
- ✅ Liquid Glass material system
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ GitHub repository initialized

## 📋 Prerequisites

Install these before starting:

### macOS
```bash
# Install Homebrew packages
brew install node@18 rust postgresql

# Verify installations
node --version  # Should be v18+
rustc --version # Should be 1.70+
psql --version  # Should be 14+
```

### Linux (Ubuntu/Debian)
```bash
# Update package manager
sudo apt update

# Install dependencies
sudo apt install -y curl git build-essential pkg-config libssl-dev
curl https://sh.rustup.rs -sSf | sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 18
nvm install 18
nvm use 18

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verify
node --version
rustc --version
psql --version
```

### Windows
```bash
# Install via Chocolatey (or manually download)
choco install nodejs rust postgresql

# Or use official installers:
# Node: https://nodejs.org/
# Rust: https://rustup.rs/
# PostgreSQL: https://www.postgresql.org/download/windows/

# Verify
node --version
rustc --version
psql --version
```

## 🚀 Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# You're already in the repo, so just install
npm install

# This installs dependencies for all packages and apps
# (uses npm workspaces)
```

**Expected output**: No errors, all packages installed.

### 2. Database Setup

Choose one option:

#### Option A: Local PostgreSQL (Recommended for Development)

```bash
# Start PostgreSQL service

# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows - already running as service

# Create database and user
psql -U postgres

# In PostgreSQL shell:
CREATE USER nexa_dev WITH PASSWORD 'nexa_dev_password';
CREATE DATABASE nexa OWNER nexa_dev;
GRANT ALL PRIVILEGES ON DATABASE nexa TO nexa_dev;
\q

# Test connection
psql -U nexa_dev -d nexa -h localhost
```

#### Option B: Supabase (Cloud PostgreSQL - Recommended for Production)

```bash
# 1. Go to https://supabase.com
# 2. Create a free account
# 3. Create a new project
# 4. Copy the connection string from Settings → Database
# 5. Use it as your DATABASE_URL
```

### 3. Environment Configuration

```bash
# Create your environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

**Configuration values:**

```env
# Database (example values)
DATABASE_URL="postgresql://nexa_dev:nexa_dev_password@localhost:5432/nexa"

# OAuth - Get from GitHub
# https://github.com/settings/developers
GITHUB_ID="your_github_app_id"
GITHUB_SECRET="your_github_app_secret"

# OAuth - Get from Google
# https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# NextAuth Secret (generate random)
NEXTAUTH_SECRET="openssl rand -base64 32"

# URLs
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set Up OAuth (GitHub)

```bash
# 1. Go to https://github.com/settings/developers
# 2. New OAuth App
# 3. Application name: Nexa (local)
# 4. Homepage URL: http://localhost:3000
# 5. Authorization callback URL: http://localhost:3000/api/auth/callback/github
# 6. Copy Client ID and Secret to .env.local
```

### 5. Set Up OAuth (Google)

```bash
# 1. Go to https://console.cloud.google.com
# 2. Create new project "Nexa Local"
# 3. Enable OAuth 2.0
# 4. Create OAuth consent screen (External)
# 5. Create OAuth 2.0 Client ID (Web application)
# 6. Authorized JavaScript origins: http://localhost:3000
# 7. Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
# 8. Copy Client ID and Secret to .env.local
```

### 6. Initialize Database Schema

```bash
# Create tables from Prisma schema
npm run db:push

# OR with migration (recommended):
npm run db:migrate
```

**Expected**: "Database synced successfully"

### 7. Verify Setup

```bash
# Test each component

# Test Node/TypeScript
npm run type-check

# Test database connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Test builds
npm run build:web
npm run build:marketing
```

## 🎯 Running Development Servers

Open 3 terminal windows:

### Terminal 1: Web App
```bash
npm run dev:web
# Runs on http://localhost:3000
```

### Terminal 2: Desktop App
```bash
npm run dev:desktop
# Launches native window
```

### Terminal 3: Marketing Site
```bash
npm run dev:marketing
# Runs on http://localhost:3001
```

## 📊 Database Management

```bash
# View database in GUI
npm run db:studio
# Opens Prisma Studio at http://localhost:5555

# Create migration after schema changes
npm run db:migrate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Sync schema without migration
npm run db:push
```

## 🏗️ Project Structure Reference

```
nexa/
├── apps/
│   ├── web/                # Next.js app (http://localhost:3000)
│   ├── desktop/            # Tauri desktop app
│   └── marketing/          # Next.js marketing (http://localhost:3001)
├── packages/
│   ├── branding/           # Brand config (logo, name, urls)
│   ├── theme/              # Theme system + Liquid Glass
│   ├── database/           # Prisma schema
│   ├── auth/               # Auth utilities
│   ├── ui/                 # UI components (to be built)
│   ├── icons/              # Icon library (to be built)
│   └── [others]/           # Additional packages
├── .env.local              # Your local env vars (DON'T commit)
├── README.md               # General documentation
├── SETUP_GUIDE.md          # This file
└── package.json            # Root workspace config
```

## 🔧 Troubleshooting

### "PostgreSQL connection refused"
```bash
# Ensure PostgreSQL is running
# macOS: brew services start postgresql
# Linux: sudo service postgresql start
# Windows: Check Services for PostgreSQL

# Verify connection string
psql -U nexa_dev -d nexa -h localhost
```

### "port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev:web -- -p 3002
```

### "Prisma client not found"
```bash
# Regenerate Prisma client
npx prisma generate
npm install
```

### "Module not found" errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run type-check
```

### Tauri build fails
```bash
# Update Tauri
npm install -g @tauri-apps/cli@latest

# Clear cache
rm -rf apps/desktop/src-tauri/target

# Try again
npm run build:desktop
```

## 🚢 Deployment Preparation

### Vercel (Web + Marketing)

```bash
# 1. Connect to Vercel
# https://vercel.com/new
# - Select your GitHub repo
# - It auto-detects Next.js

# 2. Environment variables
# Add to Vercel project settings:
# - DATABASE_URL
# - GITHUB_ID, GITHUB_SECRET
# - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
# - NEXTAUTH_SECRET (different from dev)
# - NEXTAUTH_URL (your Vercel domain)

# 3. Deploy
git push origin main
# Automatically deploys to Vercel
```

### Desktop App (GitHub Releases)

```bash
# 1. Build for all platforms
npm run build:all

# 2. Find installers in:
# - apps/desktop/src-tauri/target/release/bundle/

# 3. Create GitHub release
# - Upload .msi (Windows)
# - Upload .dmg (macOS)
# - Upload .AppImage (Linux)
```

## 🔐 Security Checklist

- [ ] Never commit `.env.local`
- [ ] Use `.env.example` for documentation
- [ ] Rotate OAuth secrets periodically
- [ ] Use different secrets for dev/prod
- [ ] Enable HTTPS in production
- [ ] Set up CORS properly
- [ ] Enable database backups
- [ ] Use secrets management (1Password, Vault)

## 📝 Next Steps

After setup is complete:

1. **Run dev servers** (see "Running Development Servers")
2. **Test functionality**:
   - [ ] Can you visit http://localhost:3000?
   - [ ] Can you visit http://localhost:3001?
   - [ ] Can you run desktop app?
   - [ ] Can you sign up/login?
3. **Start developing** - see README.md for structure
4. **Build features** - each package can be extended
5. **Deploy** - follow deployment section

## 📞 Getting Help

If you encounter issues:

1. Check troubleshooting section above
2. Read error messages carefully
3. Check `.env.local` configuration
4. Verify all prerequisites are installed
5. Check GitHub Issues: https://github.com/pxdns/gatherguesswhat/issues

## 🎉 You're Ready!

Your Nexa development environment is now ready.

Start with:
```bash
npm run dev:web
# Then visit http://localhost:3000
```

Happy coding! 🚀
