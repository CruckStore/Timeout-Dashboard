import React from 'react';
import TimerDisplay from '../../components/TimerDisplay';
import logo from '../../assets/logo.png';

const SecondaryScreen = () => {
  return (
    <div className="secondary-screen">
      <TimerDisplay />
      <img src={logo} alt="Logo" className="logo" />
    </div>
  );
};

export default SecondaryScreen;
