import React from 'react';
import { useTimer } from '../context/TimerContext';
import { formatTime } from '../utils/timeUtils';

const TimerDisplay = () => {
  const { time } = useTimer();
  console.log('TimerDisplay time:', time);
  return <div className="ds-digital">{formatTime(time)}</div>;
};

export default TimerDisplay;