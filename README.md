# Pomodoro Timer (Electron + React)

Fixed-window Pomodoro timer for macOS, built with Electron + React + Vite. The current iteration ships the full 25-minute countdown experience (window UI, timer logic, alert, notification) so future contributors can iterate on customization, persistence, and cross-platform packaging.

## Current Capabilities

- **Docked window UI**: launches as a fixed-size macOS desktop window (shows in the Dock and can be minimized like a regular app).
- **Timer controls**: 25:00 default countdown with play/pause toggle and automatic reset when the session finishes.
- **Session feedback**: audible chime plus native notification ("Time's up! Take a break.") on completion.
- **Renderer**: React/Vite timer UI that mirrors the provided mock (red hero background, large digits, centered button).
- **Packaging**: `electron-builder` setup emitting unsigned `.app` + `.dmg` artifacts (signing/notarization still manual).

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

1. Clone and install Node 22.22.0 via `nvm install` (or install manually and match `.nvmrc`).
2. Install all dependencies (root + renderer) with a single command:

   ```bash
   npm install
   ```

   This uses npm workspaces to manage both the Electron main process and the React renderer.

3. Run the desktop app in dev mode:

   ```bash
   npm run dev
   ```

`npm run dev` starts the main/preload TypeScript watchers, the Vite dev server, and Electron once the compiled files exist. A docked Pomodoro window opens automatically when everything is ready.

### Using the timer

1. Click `START` to begin the 25-minute focus block.
2. The button toggles to `PAUSE`; click it again to pause/resume.
3. When the timer reaches `00:00`, the window resets to `25:00`, plays a short chime, and macOS shows a notification ("Time's up! Take a break.").
4. Start again whenever you’re ready.

## Building a macOS DMG

1. Ensure dependencies are installed (see steps above).
2. From the repo root run:

   ```bash
   npm run build
   ```

This runs the renderer build, compiles the Electron main + preload bundles, and calls `electron-builder`. Artifacts land in `release/` (configurable via `build/electron-builder.yml`). Signing/notarization is not set up yet; add `CSC_IDENTITY_AUTO_DISCOVERY=true` and Apple credentials when you’re ready to distribute.

Folder highlights:

- `dist/main` → compiled Electron main process output
- `dist/preload` → compiled preload bridge
- `dist/renderer` → Vite renderer bundle consumed by Electron
- `release/` → unsigned `.app` + `.dmg` outputs

## Project Structure

```
app/
  main/       # Electron window creation + notification wiring
  preload/    # IPC bridge exposing timerComplete()
  renderer/   # React/Vite UI for the Pomodoro timer
assets/
  icons/      # App/dock/tray icons for packaging
build/
  electron-builder.yml
.nvmrc        # Node version pin (22.22.0)
.npmrc        # engine-strict to ensure Node compatibility
.editorconfig / .eslintrc.cjs / .prettierrc  # lint & format baseline

## Troubleshooting

- `npm use` is not a valid command. Use `nvm use` (Node Version Manager) or install Node 22 manually (e.g., `brew install node@22` and export `PATH="/usr/local/opt/node@22/bin:$PATH"`).
- `npm install` `EBADENGINE` errors indicate you’re on Node 16/npm 8. Switch to Node 22.22.0 and reinstall.
- Blank renderer window in dev? Ensure `dist/main/main.js` and `dist/preload/index.js` exist (`npm run build:main && npm run build:preload`), then restart `npm run dev`.
- Seeing Vite’s preview page instead of the Electron window? Run `npm run dev` from the repo root so Electron launches alongside Vite.
- Notifications not showing? macOS may block the first notification—open System Settings → Notifications → Pomodoro Timer and allow alerts.
```

## Roadmap Snapshot

- [x] Docked window with timer UI/logic
- [x] Native notification + audible alert on completion
- [ ] Configurable focus + break durations
- [ ] Menu-bar status indicator / countdown
- [ ] Native notifications for focus/break transitions (break cycles)
- [ ] Persisted preferences/settings window
- [ ] Windows + Linux targets in `electron-builder`
- [ ] macOS signing + notarization automation

Use this README as a living snapshot when adding features; update sections above as the app evolves.
