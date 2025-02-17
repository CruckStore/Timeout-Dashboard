import React from 'react';
import { useTimer } from '../context/TimerContext';
import { formatTime } from '../utils/timeUtils';

const TimerDisplay = () => {
  const { time } = useTimer();
  return <span className="ds-digital">{formatTime(time)}</span>;
};

export default TimerDisplay;
