import { useState, useRef, useEffect } from 'react';
import './App.css';
import './CustomTitleBar.css';
import CustomTitleBar from './CustomTitleBar';

const TAB_CONFIG = {
  pomodoro: { label: 'Pomodoro', duration: 25 * 60, color: '#ad4f4f' },
  'short break': { label: 'Short Break', duration: 5 * 60, color: '#4f86ad' },
  'long break': { label: 'Long Break', duration: 15 * 60, color: '#4fad6a' },
};

function App() {
  const [selectedTab, setSelectedTab] = useState<'pomodoro' | 'short break' | 'long break'>(
    'pomodoro',
  );
  const [timeLeft, setTimeLeft] = useState(TAB_CONFIG[selectedTab].duration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTimeLeft(TAB_CONFIG[selectedTab].duration);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [selectedTab]);

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
            return TAB_CONFIG[selectedTab].duration;
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
  }, [isRunning, selectedTab]);

  return (
    <div className="main-bg" style={{ background: TAB_CONFIG[selectedTab].color }}>
      <CustomTitleBar />
      <div className="tab-bar">
        {['pomodoro', 'short break', 'long break'].map((tab) => {
          // Helper: Current main background color
          const mainBg = TAB_CONFIG[selectedTab].color;
          // Parse hex color to rgba for 50% opacity
          const hexToRgba = (hex) => {
            const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
            return `rgba(${r}, ${g}, ${b}, 0.5)`;
          };
          const inactiveBg = hexToRgba(mainBg.replace('#', ''));
          let activeBg = inactiveBg;
          if (tab === 'pomodoro') activeBg = 'rgba(120, 40, 40, 0.5)';
          if (tab === 'short break') activeBg = 'rgba(40, 80, 120, 0.5)';
          if (tab === 'long break') activeBg = 'rgba(40, 120, 60, 0.5)';
          return (
            <button
              key={tab}
              className={`tab-btn${selectedTab === tab ? ' active' : ''}`}
              style={{
                background: selectedTab === tab ? activeBg : inactiveBg,
              }}
              onClick={() => setSelectedTab(tab as keyof typeof TAB_CONFIG)}
            >
              {TAB_CONFIG[tab].label}
            </button>
          );
        })}

      </div>
      <div className="center-content">
        <div className="timer-big">{formatTime(timeLeft)}</div>
        <button className="action-btn" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'PAUSE' : 'START'}
        </button>
      </div>
    </div>
  );
}

export default App;
