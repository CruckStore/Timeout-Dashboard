import React from 'react';
import { useTimer } from '../../context/TimerContext';
import logo from '../../assets/logo.png';

const MainScreen = () => {
  const { time } = useTimer();

  return (
    <div className="main-screen">
      <img src={logo} alt="Logo" className="logo" />
      <div className="timer">
        <span className="ds-digital">{time}</span>
      </div>
    </div>
  );
};

export default MainScreen;
