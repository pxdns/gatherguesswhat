#!/bin/bash

# CS Offline - Mac Build Script
# Just run: bash build-mac.sh

set -e  # Exit on error

echo "🍎 CS Offline - Mac Binary Builder"
echo "=================================="
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

if ! command -v cargo &> /dev/null; then
  echo "❌ Rust not found. Install from https://sh.rustup.rs"
  exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ Cargo: $(cargo --version)"
echo ""

# Step 1: Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Step 2: Build web app
echo ""
echo "🏗️  Building web app (this minifies everything)..."
npm run build

# Step 3: Build Tauri Mac binary
echo ""
echo "🔨 Building Mac binary (this takes 5-15 minutes on first run)..."
echo "   Grab a coffee ☕"
echo ""

npm run tauri:build:mac

echo ""
echo "✅ SUCCESS! Your Mac app is ready:"
echo ""
echo "   📁 Application:"
echo "   src-tauri/target/universal-apple-darwin/release/CS Offline.app"
echo ""
echo "   📦 Installer (for sharing):"
echo "   src-tauri/target/universal-apple-darwin/release/CS Offline.dmg"
echo ""
echo "🚀 To run it right now:"
echo "   open 'src-tauri/target/universal-apple-darwin/release/CS Offline.app'"
echo ""
echo "📤 To share with friends:"
echo "   Send them the .dmg file. They can just double-click to install."
echo ""
