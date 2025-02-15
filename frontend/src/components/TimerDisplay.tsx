import React from 'react';
import { useTimer } from '../context/TimerContext';

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TimerDisplay = () => {
  const { time } = useTimer();
  return <span className="ds-digital">{formatTime(time)}</span>;
};

export default TimerDisplay;
