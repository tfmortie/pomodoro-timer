import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pomodoro', {
  version: () => '0.0.1',
  timerComplete: () => ipcRenderer.send('timer-complete'),
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  },
});
