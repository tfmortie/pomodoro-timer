export interface PomodoroAPI {
  version: () => string;
  timerComplete: () => void;
}

declare global {
  interface Window {
    pomodoro: PomodoroAPI;
  }
}

export {};
