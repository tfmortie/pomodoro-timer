import { contextBridge, ipcRenderer } from 'electron';
import type { PomodoroAPI } from './types';

const api: PomodoroAPI = {
  version: () => '0.0.1',
  timerComplete: () => ipcRenderer.send('timer-complete'),
  readLogs: () => ipcRenderer.invoke('read-logs'),
  timerStart: (payload: {
    durationSeconds: number;
    mode: string;
    task: string;
    startedAt: string;
  }) => ipcRenderer.send('timer-start', payload),
  timerPause: () => ipcRenderer.send('timer-pause'),
  timerResume: () => ipcRenderer.send('timer-resume'),
  timerReset: (payload: { durationSeconds: number; mode: string }) =>
    ipcRenderer.send('timer-reset', payload),
  onTimerTick: (callback: (timeLeft: number) => void) =>
    ipcRenderer.on('timer-tick', (_event, timeLeft: number) => callback(timeLeft)),
  removeTimerTick: () => ipcRenderer.removeAllListeners('timer-tick'),
  getTimerState: () => ipcRenderer.invoke('timer-get-state'),
  windowControl: (action: 'close' | 'minimize' | 'maximize' | 'restore') =>
    ipcRenderer.send('window-control', action),
};

contextBridge.exposeInMainWorld('pomodoro', api);
