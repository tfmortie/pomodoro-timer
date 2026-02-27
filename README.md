# Pomodoro Timer (Electron + React)

Lightweight Pomodoro timer designed to live entirely in the macOS menu bar. Built with Electron, React, Vite, and TypeScript so the UI layer stays portable and ready for future Windows/Linux builds.

## Current Capabilities

- Renders a tray icon in the macOS menu bar
- Tray menu exposes two actions: `About` (shows a small window with "Pomodoro Timer app") and `Quit Pomodoro Timer`
- Modular repository layout with separate folders for the Electron main process, preload bridge, and React renderer
- Electron Builder configuration in place for producing macOS `.dmg` installers (other OS targets can be added later)

## Tech Stack

- Electron (main process & system tray integration)
- React + Vite + TypeScript (renderer UI)
- electron-builder (packaging)
- ESLint + Prettier + TypeScript project refs

## Prerequisites

- macOS 13+
- Node.js 22.x (see `.nvmrc` for the exact version)
- npm 11+ (ships with Node 22) or pnpm/yarn if you prefer

## Getting Started

```bash
git clone <repo-url>
cd pomodoro-timer
nvm install 22.22.0   # first-time setup
nvm use                # loads version from .nvmrc (or export PATH to node@22)
npm install            # root dependencies (Electron main & tooling)
cd app/renderer && npm install && cd ../..  # renderer dependencies
npm run dev
```

`npm run dev` launches Vite (renderer) and the Electron main process concurrently. A tray icon appears in the macOS menu bar; click it to access **About** and **Quit Pomodoro Timer**.

## Building a macOS DMG

```bash
nvm use
npm install
cd app/renderer && npm install && cd ../..
npm run build
```

Artifacts land in `release/` (configurable via `build/electron-builder.yml`). Signing/notarization is not set up yet; add `CSC_IDENTITY_AUTO_DISCOVERY=true` and Apple credentials when you’re ready to distribute.

## Project Structure

```
app/
  main/       # Electron entry + tray wiring
  preload/    # IPC bridge (minimal today, expandable later)
  renderer/   # React/Vite UI for About window + future controls
assets/
  icons/      # Tray icons per platform (macOS template icon provided)
build/
  electron-builder.yml
.nvmrc        # Node version pin (22.22.0)
.npmrc        # engine-strict to ensure Node compatibility

## Troubleshooting

- `npm use` is not a valid command. Use `nvm use` (Node Version Manager) or install Node 22 manually (e.g., `brew install node@22` and export `PATH="/usr/local/opt/node@22/bin:$PATH"`).
- `npm install` errors complaining about `EBADENGINE` mean you’re running an older Node (v16) or npm (v8). Upgrade to Node 22.x (with npm 10+/11+) before installing dependencies.
```

## Roadmap Snapshot

- [x] Menu-bar icon with About & Quit actions
- [ ] Core Pomodoro timer logic running in the main process
- [ ] UI controls for session start/stop + break durations
- [ ] Notifications for session transitions
- [ ] Cross-platform builds (Windows/Linux targets in electron-builder)
- [ ] Persisted preferences/settings window

Use this README as a living snapshot when adding features; update sections above as the app evolves.
