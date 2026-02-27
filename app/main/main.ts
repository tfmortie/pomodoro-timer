import path from 'node:path';
import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';

let tray: Tray | null = null;
let aboutWindow: BrowserWindow | null = null;

const isProd = process.env.NODE_ENV === 'production';

const createAboutWindow = () => {
  if (aboutWindow) {
    aboutWindow.show();
    return aboutWindow;
  }

  aboutWindow = new BrowserWindow({
    width: 320,
    height: 160,
    resizable: false,
    maximizable: false,
    minimizable: false,
    show: false,
    frame: true,
    title: 'About Pomodoro Timer',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isProd) {
    aboutWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  } else {
    aboutWindow.loadURL('http://localhost:5173');
    aboutWindow.webContents.openDevTools({ mode: 'detach' });
  }

  aboutWindow.on('ready-to-show', () => aboutWindow?.show());
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  return aboutWindow;
};

const createTray = () => {
  const iconPath = path.join(__dirname, '../../assets/icons/trayTemplate.png');
  const image = nativeImage.createFromPath(iconPath);
  image.setTemplateImage(true);
  tray = new Tray(image);
  tray.setToolTip('Pomodoro Timer');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'About',
      click: () => {
        createAboutWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Pomodoro Timer',
      role: 'quit',
    },
  ]);

  tray.setContextMenu(contextMenu);
};

const createApp = () => {
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createTray();
};

app.whenReady().then(createApp);

app.on('window-all-closed', () => {
  /* keep app running in tray */
});

app.on('before-quit', () => {
  tray?.destroy();
});
