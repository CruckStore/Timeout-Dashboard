import React from 'react';
import TimerDisplay from '../../components/TimerDisplay';
import logo from '../../assets/logo.png';

const SecondaryScreen = () => {
  return (
    <div className="secondary-screen">
      <div className="timer" style={{ textAlign: 'center', marginTop: '20px' }}>
        <TimerDisplay />
      </div>
      <div className="logo-container" style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
        <img src={logo} alt="Logo" className="logo" />
      </div>
    </div>
  );
};

export default SecondaryScreen;
