import { useState, useEffect, useCallback } from 'react';
import './App.css';

const DEFAULT_TIME = 25 * 60; // 25 minutes in seconds

function App() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playAlarm = useCallback(() => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  }, []);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    playAlarm();
    // Notify main process
    if ((window as any).pomodoro?.timerComplete) {
      (window as any).pomodoro.timerComplete();
    }
  }, [playAlarm]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return DEFAULT_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleComplete]);

  return (
    <div className="timer-container">
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <button className={`timer-button ${isRunning ? 'pause' : 'play'}`} onClick={toggleTimer}>
        {isRunning ? '⏸' : '▶'}
      </button>
    </div>
  );
}

export default App;
