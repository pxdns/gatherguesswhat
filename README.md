# Nexa - Production Communication Platform

Where communities come together.

A complete, production-quality communication and community platform built with modern technologies.

## 🏗️ Architecture

```
nexa/
├── apps/
│   ├── web/              # Next.js web application
│   ├── desktop/          # Tauri desktop app (Windows, Linux, macOS)
│   └── marketing/        # Marketing website
├── packages/
│   ├── branding/         # Brand identity & config
│   ├── theme/            # Theme system & Liquid Glass
│   ├── glass/            # Glass morphism components
│   ├── icons/            # Icon library
│   ├── ui/               # UI components
│   ├── database/         # Prisma ORM & schema
│   ├── auth/             # Authentication logic
│   ├── api/              # Shared API utilities
│   ├── moderation/       # Moderation system
│   ├── types/            # TypeScript types
│   └── config/           # Shared configuration
└── prisma/               # Database migrations
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- Rust 1.70+ (for Tauri desktop app)
- PostgreSQL 14+ (or Supabase)
- Git

### Setup

1. **Clone and install**
```bash
git clone https://github.com/pxdns/gatherguesswhat.git
cd gatherguesswhat
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `GITHUB_ID`, `GITHUB_SECRET`: GitHub OAuth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

3. **Setup database**
```bash
npm run db:push
# or with migrations:
npm run db:migrate
```

4. **Start development**

Terminal 1 - Web app:
```bash
npm run dev:web
# Opens at http://localhost:3000
```

Terminal 2 - Desktop app:
```bash
npm run dev:desktop
```

Terminal 3 - Marketing site:
```bash
npm run dev:marketing
# Opens at http://localhost:3001
```

## 🛠️ Available Commands

### Development
```bash
npm run dev:web        # Start web app
npm run dev:desktop    # Start desktop app
npm run dev:marketing  # Start marketing site
```

### Building
```bash
npm run build:web      # Build web app
npm run build:desktop  # Build desktop app (all platforms)
npm run build:all      # Build everything

# Platform-specific desktop builds:
npm run build:win      # Windows
npm run build:linux    # Linux
npm run build:macos    # macOS Intel
npm run build:macos-arm # macOS Apple Silicon
```

### Database
```bash
npm run db:push        # Sync schema to database
npm run db:migrate     # Create migration
npm run db:studio      # Open Prisma Studio
```

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Desktop**: Tauri (Rust + Webview)

### Backend
- **Runtime**: Node.js + Vercel (deployment)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js + OAuth (GitHub, Google)
- **Real-time**: Supabase Realtime (optional)
- **Storage**: Supabase Storage (optional)

### Infrastructure
- **Hosting**: Vercel (web/marketing)
- **Desktop**: Tauri (all platforms)
- **Database**: Supabase or self-hosted PostgreSQL
- **VCS**: GitHub

## 🎨 Design System

### Branding
- **Product Name**: Nexa
- **Tagline**: Where communities come together
- **Color System**: Neutral foundation with customizable accents
- **Typography**: Modern, readable system fonts
- **Icons**: Custom coherent icon family

### Liquid Glass Material System
```
Ultra Thin  -> 10px blur, 0.8 opacity
Thin        -> 15px blur, 0.8 opacity
Regular     -> 20px blur, 0.75 opacity
Thick       -> 30px blur, 0.7 opacity
Solid       -> No blur, opaque
```

### Themes
- Light / Dark (default)
- Graphite / Midnight
- Forest / Ocean / Amber / Rose / Violet
- Monochrome
- Custom (user-configurable)

## 🔐 Security

- **Authentication**: OAuth 2.0 + Session-based
- **Authorization**: Server-side role-based access control
- **Validation**: Input validation + type safety
- **Storage**: Encrypted sensitive data
- **API**: Rate limiting + CORS protection
- **Content**: Server-side filtering + moderation

## 📊 Database Schema

Key entities:
- **User**: Accounts, profiles, settings
- **Community**: Groups, channels, members
- **Channel**: Text/announcement/media channels
- **Message**: Communications with reactions
- **Role**: Permissions & moderation
- **Report**: Safety & moderation reports
- **ModerationAction**: Warnings, mutes, bans

## 🚢 Deployment

### Web App (Vercel)
```bash
# Push to main branch - automatic deployment
git push origin main
```

Environment variables needed on Vercel:
- `DATABASE_URL`
- `GITHUB_ID`, `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your Vercel domain)

### Desktop App
```bash
# Releases via GitHub Actions (when configured)
npm run build:all
```

Distributable files:
- Windows: `.msi` installer
- macOS: `.dmg` installer
- Linux: `.AppImage` + `.deb`

## 📝 Development Guidelines

### Coding Standards
- TypeScript strict mode enabled
- ESLint + Prettier enforced
- No hard-coded product names (use `@nexa/branding`)
- Centralized configuration (no scattered env vars)

### File Organization
- Shared code → `packages/`
- App-specific → `apps/*/`
- No feature duplications
- Clear separation of concerns

### Commits
```bash
# Use conventional commits:
git commit -m "feat: add community creation flow"
git commit -m "fix: resolve message rendering bug"
git commit -m "refactor: optimize theme provider"
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL is correct
# Test with: npx prisma db execute --stdin < query.sql
```

### Build Failures
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Tauri cache
rm -rf apps/desktop/src-tauri/target
```

### Port Conflicts
- Web app: `3000` (configurable)
- Marketing: `3001`
- Desktop: Uses native window

## 📞 Support

- Issues: GitHub Issues
- Docs: `/docs` (when available)
- Email: support@nexachat.com

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for communities