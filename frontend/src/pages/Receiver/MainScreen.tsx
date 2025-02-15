import React from 'react';
import TimerDisplay from '../../components/TimerDisplay';
import logo from '../../assets/logo.png';

const MainScreen = () => {
  return (
    <div className="main-screen">
      <img src={logo} alt="Logo" className="logo" />
      <div className="timer">
        <TimerDisplay />
      </div>
    </div>
  );
};

export default MainScreen;
