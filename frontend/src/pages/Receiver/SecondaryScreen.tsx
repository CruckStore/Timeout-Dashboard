import React from 'react';
import { useTimer } from '../../context/TimerContext';
import logo from '../../assets/logo.png';

const SecondaryScreen = () => {
  const { time } = useTimer();

  return (
    <div className="secondary-screen">
      <div className="timer" style={{ textAlign: 'center', marginTop: '20px' }}>
        <span className="ds-digital">{time}</span>
      </div>
      <div className="logo-container" style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
        <img src={logo} alt="Logo" className="logo" />
      </div>
    </div>
  );
};

export default SecondaryScreen;
