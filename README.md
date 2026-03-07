# Pomodoro Timer

Big goals are built in small, focused moments. Pomodoro Timer helps you cut through distractions and turn your to-do list into real progress. 

<h1 align="center">
    <img src="assets/PomodoroTimer.png" style="width: 40%;">
</h1>

Pomodoro Timer is heavily inspired by [Pomofocus](https://pomofocus.io/app), and is built with Electron + React + Vite. 

## Current Capabilities

- **Docked window UI**: launches as a fixed-size desktop window (shows in the Dock and can be minimized like a regular app).
- **Timer controls**: 25:00 default countdown with play/pause toggle and automatic reset when the session finishes.
- **Session feedback**: native alert window (shown even when minimized) plus notification on completion.
- **Task input + register**: task name field with a "+" register button and active task label.
- **Session logging**: CSV log file with task, mode, elapsed time, and interruption reason.
- **Log viewer**: in-app 📈 button opens a modal table of recent sessions (newest first).

## Tech Stack

- Electron (main process & system tray integration)
- React + Vite + TypeScript (renderer UI)
- electron-builder (packaging)
- ESLint + Prettier + TypeScript project refs

## Prerequisites

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

1. Enter a task name, click `+` to register it, and the label appears below the `START` button.
2. Click `START` to begin the 25-minute focus, short break or long break block.
3. The button toggles to `PAUSE`; click it again to pause/resume.
4. Use the 📈 button to view the log table in a modal.

## Logging

Sessions are logged to a CSV file for plotting and analysis. A log entry is written whenever the timer stops or resets: pause, tab change, completion, or app exit.

**Log path (cross-platform):**

- macOS: `~/Library/Application Support/Pomodoro Timer/logs/pomodoro-log.csv`
- Windows: `%APPDATA%\Pomodoro Timer\logs\pomodoro-log.csv`
- Linux: `~/.config/Pomodoro Timer/logs/pomodoro-log.csv`

**CSV columns:**

`timestamp_start,timestamp_end,task,mode,elapsed_seconds,completed,interrupted,end_reason`

## Building a macOS DMG

1. Ensure dependencies are installed (see steps above).
2. From the repo root run:

   ```bash
   npm run build
   ```

This runs the renderer build, compiles the Electron main + preload bundles, and calls `electron-builder`. Artifacts land in `release/` (configurable via `build/electron-builder.yml`). Signing/notarization is not set up yet; add `CSC_IDENTITY_AUTO_DISCOVERY=true` and Apple credentials when you’re ready to distribute.

## Installation (macOS)

1. Open the generated DMG from `release/`.
2. Drag `Pomodoro Timer.app` into the Applications folder.
3. Launch from Applications. If macOS warns about an unsigned app, use System Settings → Privacy & Security → Open Anyway.

## Installation (Windows)

1. Build or obtain a Windows installer (`.exe` or `.msi`) from your build pipeline.
2. Run the installer and follow the prompts.
3. If Windows SmartScreen warns about an unsigned app, choose “More info” → “Run anyway”.

## Installation (Linux)

1. Build or obtain a Linux package (`.AppImage`, `.deb`, or `.rpm`).
2. For AppImage: mark as executable (`chmod +x Pomodoro-Timer.AppImage`) and run it.
3. For `.deb`/`.rpm`: install using your package manager (`sudo dpkg -i` or `sudo rpm -i`).

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