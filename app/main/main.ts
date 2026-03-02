import path from 'node:path';
import { app, BrowserWindow, Notification, ipcMain } from 'electron';

let mainWindow: BrowserWindow | null = null;

const isProd = process.env.NODE_ENV === 'production';

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 550,
    vibrancy: 'fullscreen-ui',
    resizable: false,
    maximizable: false,
    minimizable: true,
    show: true,
    frame: true,
    title: 'Pomodoro Timer',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isProd) {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Show app in dock
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

// Handle timer completion from renderer
ipcMain.on('timer-complete', () => {
  // Show notification
  new Notification({
    title: 'Pomodoro Timer',
    body: "Time's up! Take a break.",
  }).show();
});
