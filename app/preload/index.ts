import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pomodoro', {
  version: () => '0.0.1',
  timerComplete: () => ipcRenderer.send('timer-complete'),
});
