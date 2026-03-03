import path from 'node:path';
import { app, BrowserWindow, Notification, ipcMain } from 'electron';
let mainWindow: BrowserWindow | null = null;
const isProd = process.env.NODE_ENV === 'production';
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 480,
    resizable: true,
    maximizable: false,
    minimizable: true,
    show: true,
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
      mainWindow.close();
      break;
    case 'restore':
      mainWindow.restore();
      break;
  }
});
