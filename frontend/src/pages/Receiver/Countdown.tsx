import React from 'react';
import { useTimer } from '../../context/TimerContext';

const Countdown = () => {
  const { time } = useTimer();

  return (
    <div className="countdown-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <span className="ds-digital" style={{ fontSize: '5rem' }}>{time}</span>
    </div>
  );
};

export default Countdown;
