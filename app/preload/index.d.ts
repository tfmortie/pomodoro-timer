export interface PomodoroAPI {
  version: () => string;
}

declare global {
  interface Window {
    pomodoro: PomodoroAPI;
  }
}

export {};
