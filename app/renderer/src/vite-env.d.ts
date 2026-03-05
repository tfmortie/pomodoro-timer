/// <reference types="vite/client" />

import type { PomodoroAPI } from '../../preload/types';

declare global {
  interface Window {
    pomodoro?: PomodoroAPI;
  }
}

export {};
