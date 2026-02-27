import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('pomodoro', {
  version: () => '0.0.1',
});
