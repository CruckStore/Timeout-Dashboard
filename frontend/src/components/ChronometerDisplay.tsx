import React from 'react';
import { useChronometer } from '../context/ChronometerContext';
import { formatTime } from '../utils/timeUtils';

const ChronometerDisplay = () => {
  const { time } = useChronometer();
  return <div className="ds-digital">{formatTime(time)}</div>;
};

export default ChronometerDisplay;
