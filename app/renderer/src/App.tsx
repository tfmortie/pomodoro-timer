import { useState, useRef, useEffect } from 'react';
import './App.css';

const DEFAULT_TIME = 25 * 60;

function App() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setIsRunning(false);
            return DEFAULT_TIME;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  return (
    <div className="main-bg">
      <div className="timer-big">{formatTime(timeLeft)}</div>
      <button className="action-btn" onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'PAUSE' : 'START'}
      </button>
    </div>
  );
}

export default App;
