import { useState, useRef, useEffect } from 'react';
import type { PomodoroAPI } from '../../preload/types';
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
  const [taskInput, setTaskInput] = useState('');
  const [activeTask, setActiveTask] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logRows, setLogRows] = useState<Array<Record<string, string>>>([]);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    const nextDuration = TAB_CONFIG[selectedTab].duration;
    setTimeLeft(nextDuration);
    timeLeftRef.current = nextDuration;
    setIsRunning(false);
    (window as Window & { pomodoro?: PomodoroAPI }).pomodoro?.timerReset({
      durationSeconds: nextDuration,
      mode: selectedTab,
    });
  }, [selectedTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleTick = (value: number) => {
      timeLeftRef.current = value;
      setTimeLeft(value);
      if (value === 0 && isRunning) {
        setIsRunning(false);
      }
    };
    (window as Window & { pomodoro?: PomodoroAPI }).pomodoro?.onTimerTick(handleTick);
    return () => {
      (window as Window & { pomodoro?: PomodoroAPI }).pomodoro?.removeTimerTick();
    };
  }, [isRunning]);

  useEffect(() => {
    const syncFromMain = async () => {
      const api = window.pomodoro as PomodoroAPI | undefined;
      if (!api || !api.getTimerState) return;
      const latest = await api.getTimerState();
      if (typeof latest === 'number' && !Number.isNaN(latest)) {
        timeLeftRef.current = latest;
        setTimeLeft(latest);
      }
    };
    syncFromMain();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const api = window.pomodoro as PomodoroAPI | undefined;
        if (!api || !api.getTimerState) return;
        api.getTimerState().then((latest: number) => {
          if (!Number.isNaN(latest)) {
            timeLeftRef.current = latest;
            setTimeLeft(latest);
          }
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRegisterTask = () => {
    const trimmed = taskInput.trim();
    if (!trimmed) return;
    setActiveTask(trimmed);
  };

  const fetchLogs = async () => {
    if (!window.pomodoro?.readLogs) return;
    const csvText = await window.pomodoro.readLogs();
    if (!csvText) {
      setLogRows([]);
      return;
    }
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) {
      setLogRows([]);
      return;
    }
    const headers = lines[0]
      .replace(/^\uFEFF/, '')
      .split(',')
      .map((header) => header.trim());
    const parseCsvLine = (line: string) => {
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          fields.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current);
      return fields;
    };
    const rows = lines
      .slice(1)
      .filter((line) => line.trim().length > 0)
      .map((line: string) => {
        const cols = parseCsvLine(line);
        const row: Record<string, string> = {};
        headers.forEach((header: string, index: number) => {
          const raw = cols[index] || '';
          row[header] = raw.trim();
        });
        return row;
      })
      .filter((row: Record<string, string>) => row.timestamp_end);
    rows.sort((a: Record<string, string>, b: Record<string, string>) =>
      a.timestamp_end < b.timestamp_end ? 1 : -1,
    );
    setLogRows(rows);
  };

  useEffect(() => {
    if (showLogModal) {
      fetchLogs();
    }
  }, [showLogModal]);

  const handleStartPause = () => {
    const pomodoroApi = window.pomodoro as PomodoroAPI | undefined;
    if (isRunning) {
      pomodoroApi?.timerPause();
      setIsRunning(false);
      return;
    }
    const task = activeTask || taskInput.trim();
    pomodoroApi?.timerStart({
      durationSeconds: timeLeftRef.current,
      mode: selectedTab,
      task,
      startedAt: new Date().toISOString(),
    });
    setIsRunning(true);
  };

  return (
    <div className="main-bg" style={{ background: TAB_CONFIG[selectedTab].color }}>
      <CustomTitleBar />
      <div className="tab-bar">
        {(Object.keys(TAB_CONFIG) as Array<keyof typeof TAB_CONFIG>).map((tab) => {
          // Helper: Current main background color
          const mainBg = TAB_CONFIG[selectedTab].color;
          // Parse hex color to rgba for 50% opacity
          const hexToRgba = (hex: string) => {
            const matches = hex.match(/\w\w/g);
            if (!matches || matches.length < 3) {
              return 'rgba(0, 0, 0, 0.35)';
            }
            const [r, g, b] = matches.map((x: string) => parseInt(x, 16));
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
        <div className="task-row">
          <label className="task-label" htmlFor="task-input">
            Task
          </label>
          <div className="task-input-wrap">
            <input
              id="task-input"
              className="task-input"
              type="text"
              value={taskInput}
              onChange={(event) => setTaskInput(event.target.value)}
              placeholder="Enter task"
            />
            <button className="task-add-btn" type="button" onClick={handleRegisterTask}>
              +
            </button>
            <button
              className="task-log-btn"
              type="button"
              onClick={() => setShowLogModal(true)}
              aria-label="View logs"
            >
              📈
            </button>
          </div>
        </div>
        <button className="action-btn" onClick={handleStartPause}>
          {isRunning ? 'PAUSE' : 'START'}
        </button>
        {activeTask ? <div className="active-task">{activeTask}</div> : null}
      </div>
      {showLogModal ? (
        <div className="log-modal" role="dialog" aria-modal="true">
          <div className="log-overlay" onClick={() => setShowLogModal(false)} />
          <div className="log-panel">
            <div className="log-header">
              <div className="log-title">Task Log</div>
              <button className="log-close" onClick={() => setShowLogModal(false)}>
                ×
              </button>
            </div>
            <div className="log-table-wrap">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Task</th>
                    <th>Mode</th>
                    <th>Completed</th>
                    <th>Elapsed (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {logRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="log-empty">
                        No logs yet.
                      </td>
                    </tr>
                  ) : (
                    logRows.map((row, index) => (
                      <tr key={`${row.timestamp_end}-${index}`}>
                        <td>{row.timestamp_start}</td>
                        <td>{row.timestamp_end}</td>
                        <td>{row.task}</td>
                        <td>{row.mode}</td>
                        <td>{row.completed}</td>
                        <td>{row.elapsed_seconds}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
