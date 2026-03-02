import React from 'react';

declare global {
  interface Window {
    pomodoro?: {
      ipcRenderer?: {
        send: (channel: string, ...args: any[]) => void;
      };
    };
  }
}

function getPlatform(): 'darwin' | 'win32' | 'linux' | 'browser' {
  if (window && window.navigator) {
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) return 'darwin';
    if (platform.includes('win')) return 'win32';
    if (platform.includes('linux')) return 'linux';
  }
  return 'browser';
}

function sendWindowEvent(event: 'close' | 'minimize' | 'maximize' | 'restore') {
  if (window.pomodoro && window.pomodoro.ipcRenderer) {
    window.pomodoro.ipcRenderer.send('window-control', event);
  }
}

function macControls() {
  return (
    <div className="titlebar-controls-mac">
      <button
        className="traffic-light red"
        aria-label="Close"
        onClick={() => sendWindowEvent('close')}
      />
      <button
        className="traffic-light yellow"
        aria-label="Minimize"
        onClick={() => sendWindowEvent('minimize')}
      />
      <button
        className="traffic-light green"
        aria-label="Maximize"
        onClick={() => sendWindowEvent('maximize')}
      />
    </div>
  );
}

function winControls() {
  return (
    <div className="titlebar-controls-win">
      <button
        className="win-btn minimize"
        aria-label="Minimize"
        onClick={() => sendWindowEvent('minimize')}
      >
        <svg height="10" width="10">
          <rect x="2" y="8" width="6" height="2" />
        </svg>
      </button>
      <button
        className="win-btn maximize"
        aria-label="Maximize"
        onClick={() => sendWindowEvent('maximize')}
      >
        <svg height="10" width="10">
          <rect x="2" y="2" width="6" height="6" />
        </svg>
      </button>
      <button className="win-btn close" aria-label="Close" onClick={() => sendWindowEvent('close')}>
        <svg height="10" width="10">
          <line x1="2" y1="2" x2="8" y2="8" />
          <line x1="8" y1="2" x2="2" y2="8" />
        </svg>
      </button>
    </div>
  );
}

export default function CustomTitleBar() {
  const platform = getPlatform();
  return (
    <div className="custom-titlebar">
      {platform === 'darwin' ? macControls() : winControls()}
      <div className="custom-titlebar-title">Pomodoro Timer</div>
    </div>
  );
}
