import path from 'node:path';
import { app, BrowserWindow, Notification, ipcMain } from 'electron';
let mainWindow: BrowserWindow | null = null;
const isProd = app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL;
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
ipcMain.on('timer-complete', () => {
  new Notification({
    title: 'Pomodoro Timer',
    body: "Time's up! Take a break.",
  }).show();
});

// Listen for window-control events from renderer
import { ipcMain as mainIpc } from 'electron';
mainIpc.on('window-control', (event, action) => {
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
