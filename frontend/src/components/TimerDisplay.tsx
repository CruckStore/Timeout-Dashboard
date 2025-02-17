import React, { useEffect, useState } from 'react';
import { useDualTimer } from '../context/DualTimerContext';
import { formatTime } from '../utils/timeUtils';

const TimerDisplay = () => {
  const { timeChrono, timeTimer } = useDualTimer();
  const [displayMode, setDisplayMode] = useState<'chrono' | 'timer'>(() => {
    const stored = localStorage.getItem('displayMode');
    return stored === 'timer' ? 'timer' : 'chrono';
  });

  useEffect(() => {
    const onStorageChange = () => {
      const newMode = localStorage.getItem('displayMode') === 'timer' ? 'timer' : 'chrono';
      setDisplayMode(newMode);
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const displayedTime = displayMode === 'chrono' ? timeChrono : timeTimer;

  return (
    <div className="ds-digital">
      {displayMode === 'chrono' ? 'Chrono : ' : 'Timer : '}
      {formatTime(displayedTime)}
    </div>
  );
};

export default TimerDisplay;
