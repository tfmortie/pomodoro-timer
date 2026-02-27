# Pomodoro Timer (Electron + React)

Menu-bar-first Pomodoro timer for macOS, built with Electron + React + Vite. The current iteration provides the tray shell (icon, menu, about window) so future contributors can focus on adding timer logic, notifications, and cross-platform packaging.

## Current Capabilities

- macOS tray icon (template tomato outline)
- Menu actions:
  - **About** – shows a small window with “Pomodoro Timer app / Stay focused with lightweight menu bar controls.”
  - **Quit Pomodoro Timer** – exits the app
- Renderer UI is React/Vite (currently just the About view)
- Modular layout (`app/main`, `app/preload`, `app/renderer`, `assets/`) ready for Pomodoro logic
- `electron-builder` setup emitting unsigned `.dmg` installers (signing/notarization pending)

## Tech Stack

- Electron (main process & system tray integration)
- React + Vite + TypeScript (renderer UI)
- electron-builder (packaging)
- ESLint + Prettier + TypeScript project refs

## Prerequisites

- macOS 13+
- Node.js **22.22.0** (pinned in `.nvmrc`)
- npm 10+/11+ (bundled with Node 22)

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

Folder highlights:
- `dist/main` → compiled Electron main process output
- `dist/preload` → compiled preload bridge
- `dist/renderer` → Vite renderer bundle consumed by Electron
- `release/` → unsigned `.app` + `.dmg` outputs

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
.editorconfig / .eslintrc.cjs / .prettierrc  # lint & format baseline

## Troubleshooting

- `npm use` is not a valid command. Use `nvm use` (Node Version Manager) or install Node 22 manually (e.g., `brew install node@22` and export `PATH="/usr/local/opt/node@22/bin:$PATH"`).
- `npm install` `EBADENGINE` errors indicate you’re on Node 16/npm 8. Switch to Node 22.22.0 and reinstall.
- Only seeing the Vite page? Run `npm run dev` from the repo root so Electron starts alongside Vite.
- Tray icon still missing? Ensure `dist/main/main.js` and `dist/preload/index.js` exist; if not, run `npm run build:main && npm run build:preload` once.
- Seeing only the Vite preview page? Make sure you ran `npm run dev` from the repo root so Electron (tray icon) starts alongside Vite.
- Tray still missing? Verify `dist/main/main.js` and `dist/preload/index.js` exist; if not, run `npm run build:main && npm run build:preload` once.
```

## Roadmap Snapshot

- [x] Menu-bar icon with About & Quit actions
- [x] About window rendered in React/Vite
- [ ] Core Pomodoro timer logic running in the main process with IPC updates
- [ ] UI controls for session start/stop + configurable durations
- [ ] Menu-bar status indicator / countdown
- [ ] Native notifications for focus/break transitions
- [ ] Persisted preferences/settings window
- [ ] Windows + Linux targets in `electron-builder`
- [ ] macOS signing + notarization automation

Use this README as a living snapshot when adding features; update sections above as the app evolves.
