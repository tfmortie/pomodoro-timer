import path from 'node:path';
import { app, BrowserWindow, Notification, ipcMain, dialog } from 'electron';
import fs from 'node:fs';
let mainWindow: BrowserWindow | null = null;
const isProd = app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL;

const desiredUserData = path.join(app.getPath('appData'), 'Pomodoro Timer');
const legacyUserData = app.getPath('userData');
if (legacyUserData !== desiredUserData) {
  try {
    const legacyLogs = path.join(legacyUserData, 'logs', 'pomodoro-log.csv');
    const targetLogsDir = path.join(desiredUserData, 'logs');
    const targetLogs = path.join(targetLogsDir, 'pomodoro-log.csv');
    fs.mkdirSync(targetLogsDir, { recursive: true });
    if (fs.existsSync(legacyLogs) && !fs.existsSync(targetLogs)) {
      try {
        fs.renameSync(legacyLogs, targetLogs);
      } catch {
        fs.copyFileSync(legacyLogs, targetLogs);
      }
    }
  } catch {
    // Ignore migration errors; logging will still function in the new path.
  }
  app.setPath('userData', desiredUserData);
}
const createWindow = () => {
  const launchStart = Date.now();
  mainWindow = new BrowserWindow({
    width: 380,
    height: 480,
    resizable: true,
    maximizable: false,
    minimizable: true,
    show: false, // show only after load!
    frame: false, // Frameless for custom top bar
    transparent: true,
    backgroundColor: '#00000000',
    title: 'Pomodoro Timer',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // Add crash and load error logging
  const showWindow = () => {
    if (!mainWindow || mainWindow.isVisible()) return;
    mainWindow.show();
  };
  const showFallbackTimer = setTimeout(() => showWindow(), 1500);

  mainWindow.webContents.on('dom-ready', () => {
    showWindow();
  });
  mainWindow.webContents.on('did-finish-load', () => {
    showWindow();
  });
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer process gone:', details);
  });
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Renderer failed to load:', errorCode, errorDescription);
    const errorHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Renderer Load Failed</title></head><body style="font-family: sans-serif; padding: 24px;"><h1>Renderer failed to load</h1><p>${errorCode}: ${errorDescription}</p><p>Path: ${rendererPath}</p></body></html>`;
    mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
    showWindow();
  });
  const rendererPath = path.join(__dirname, '../renderer/index.html');
  if (!isProd && devServerUrl) {
    console.log('Loading renderer from dev server:', devServerUrl);
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    console.log('Loading renderer from file:', rendererPath);
    mainWindow.loadFile(rendererPath);
  }
  mainWindow.on('closed', () => {
    clearTimeout(showFallbackTimer);
    mainWindow = null;
  });
};
if (process.platform === 'darwin') {
  app.dock.show();
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const showTimerCompletionUi = () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
  dialog.showMessageBox({
    type: 'info',
    title: 'Pomodoro Timer',
    message: "Time's up!",
    detail: 'Your session has finished.',
  });
  new Notification({
    title: 'Pomodoro Timer',
    body: "Time's up! Take a break.",
  }).show();
};

type TimerMode = 'pomodoro' | 'short break' | 'long break';

const timerState: {
  intervalHandle: ReturnType<typeof setInterval> | null;
  timeLeft: number;
  mode: TimerMode;
  startEpoch: number;
  durationAtStart: number;
} = {
  intervalHandle: null,
  timeLeft: 0,
  mode: 'pomodoro',
  startEpoch: 0,
  durationAtStart: 0,
};

const emitTimerTick = () => {
  if (!mainWindow) return;
  mainWindow.webContents.send('timer-tick', timerState.timeLeft);
};

const stopTimer = () => {
  if (timerState.intervalHandle) {
    clearInterval(timerState.intervalHandle);
    timerState.intervalHandle = null;
  }
};

const handleTimerComplete = () => {
  stopTimer();
  timerState.timeLeft = 0;
  emitTimerTick();
  showTimerCompletionUi();
};

const startInterval = () => {
  stopTimer();
  timerState.startEpoch = Date.now();
  timerState.durationAtStart = timerState.timeLeft;
  timerState.intervalHandle = setInterval(() => {
    const elapsed = Math.floor((Date.now() - timerState.startEpoch) / 1000);
    timerState.timeLeft = Math.max(0, timerState.durationAtStart - elapsed);
    emitTimerTick();
    if (timerState.timeLeft <= 0) {
      handleTimerComplete();
    }
  }, 1000);
};

ipcMain.on('timer-start', (_event, payload: { durationSeconds: number; mode: TimerMode }) => {
  const duration = Math.max(0, Math.floor(payload?.durationSeconds ?? 0));
  timerState.timeLeft = duration;
  timerState.mode = payload?.mode ?? 'pomodoro';
  emitTimerTick();
  if (duration === 0) {
    handleTimerComplete();
    return;
  }
  startInterval();
});

ipcMain.on('timer-pause', () => {
  if (!timerState.intervalHandle) return;
  const elapsed = Math.floor((Date.now() - timerState.startEpoch) / 1000);
  timerState.timeLeft = Math.max(0, timerState.durationAtStart - elapsed);
  stopTimer();
  emitTimerTick();
});

ipcMain.on('timer-resume', () => {
  if (timerState.intervalHandle || timerState.timeLeft <= 0) return;
  timerState.durationAtStart = timerState.timeLeft;
  timerState.startEpoch = Date.now();
  startInterval();
});

ipcMain.on('timer-reset', (_event, payload: { durationSeconds: number; mode: TimerMode }) => {
  stopTimer();
  timerState.timeLeft = Math.max(0, Math.floor(payload?.durationSeconds ?? 0));
  timerState.mode = payload?.mode ?? 'pomodoro';
  emitTimerTick();
});

ipcMain.handle('timer-get-state', () => timerState.timeLeft);

const ensureLogsDir = () => {
  const logsDir = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  return logsDir;
};

const appendLog = (entry: {
  startedAt: string;
  endedAt: string;
  task: string;
  mode: string;
  elapsedSeconds: number;
  completed: boolean;
  interrupted: boolean;
  endReason: string;
}) => {
  const logsDir = ensureLogsDir();
  const logPath = path.join(logsDir, 'pomodoro-log.csv');
  const hasFile = fs.existsSync(logPath);
  const header =
    'timestamp_start,timestamp_end,task,mode,elapsed_seconds,completed,interrupted,end_reason\n';
  const safeTask = (entry.task || '').replace(/"/g, '""');
  const line = `${entry.startedAt},${entry.endedAt},"${safeTask}",${entry.mode},${entry.elapsedSeconds},${entry.completed},${entry.interrupted},${entry.endReason}\n`;
  fs.appendFileSync(logPath, (hasFile ? '' : header) + line, 'utf8');
};

ipcMain.on('log-session', (_event, entry) => {
  if (!entry) return;
  appendLog(entry);
});

ipcMain.handle('read-logs', () => {
  const logsDir = ensureLogsDir();
  const logPath = path.join(logsDir, 'pomodoro-log.csv');
  if (!fs.existsSync(logPath)) return '';
  return fs.readFileSync(logPath, 'utf8');
});

// Listen for window-control events from renderer
ipcMain.on('window-control', (_event, action) => {
  if (!mainWindow) return;
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      if (process.platform === 'darwin') {
        app.quit();
      } else {
        mainWindow.close();
      }
      break;
    case 'restore':
      mainWindow.restore();
      break;
  }
});
