export interface PomodoroAPI {
  version: () => string;
  timerComplete: () => void;
  readLogs: () => Promise<string>;
  timerStart: (payload: {
    durationSeconds: number;
    mode: string;
    task: string;
    startedAt: string;
  }) => void;
  timerPause: () => void;
  timerResume: () => void;
  timerReset: (payload: { durationSeconds: number; mode: string }) => void;
  onTimerTick: (callback: (timeLeft: number) => void) => void;
  removeTimerTick: () => void;
  getTimerState: () => Promise<number>;
  windowControl: (action: 'close' | 'minimize' | 'maximize' | 'restore') => void;
}

declare global {
  interface Window {
    pomodoro?: PomodoroAPI;
  }
}

export {};
