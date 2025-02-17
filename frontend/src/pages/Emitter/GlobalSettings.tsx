import React, { useState } from 'react';
import { useDualTimer } from '../../context/DualTimerContext';

const GlobalSettings = () => {
  // On récupère toutes les infos et fonctions du contexte
  const {
    timeChrono,
    isRunningChrono,
    startChrono,
    pauseChrono,
    resetChrono,

    timeTimer,
    isRunningTimer,
    startTimer,
    pauseTimer,
    resetTimer
  } = useDualTimer();

  // Input pour faire Set/Add/Remove (Chrono)
  const [inputChrono, setInputChrono] = useState<number>(0);
  // Input pour faire Set/Add/Remove (Timer)
  const [inputTimer, setInputTimer] = useState<number>(0);

  return (
    <div className="global-settings-container">
      <h1>Global Settings</h1>

      {/* SECTION CHRONO */}
      <div className="chrono-section">
        <h2>CHRONO</h2>
        <p>Temps Chrono: {timeChrono}s</p>
        <button onClick={() => (isRunningChrono ? pauseChrono() : startChrono())}>
          {isRunningChrono ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => resetChrono(0)}>Reset</button>

        <div>
          <label>Set Chrono:</label>
          <input
            type="number"
            value={inputChrono}
            onChange={(e) => setInputChrono(Number(e.target.value))}
          />
          <button onClick={() => resetChrono(inputChrono)}>Set</button>
        </div>
        <div>
          <label>Add Chrono:</label>
          <input
            type="number"
            value={inputChrono}
            onChange={(e) => setInputChrono(Number(e.target.value))}
          />
          <button onClick={() => resetChrono(timeChrono + inputChrono)}>Add</button>
        </div>
        <div>
          <label>Remove Chrono:</label>
          <input
            type="number"
            value={inputChrono}
            onChange={(e) => setInputChrono(Number(e.target.value))}
          />
          <button onClick={() => resetChrono(timeChrono - inputChrono)}>Remove</button>
        </div>
      </div>

      {/* SECTION TIMER */}
      <div className="timer-section">
        <h2>TIMER</h2>
        <p>Temps Timer: {timeTimer}s</p>
        <button onClick={() => (isRunningTimer ? pauseTimer() : startTimer())}>
          {isRunningTimer ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => resetTimer(0)}>Reset</button>

        <div>
          <label>Set Timer:</label>
          <input
            type="number"
            value={inputTimer}
            onChange={(e) => setInputTimer(Number(e.target.value))}
          />
          <button onClick={() => resetTimer(inputTimer)}>Set</button>
        </div>
        <div>
          <label>Add Timer:</label>
          <input
            type="number"
            value={inputTimer}
            onChange={(e) => setInputTimer(Number(e.target.value))}
          />
          <button onClick={() => resetTimer(timeTimer + inputTimer)}>Add</button>
        </div>
        <div>
          <label>Remove Timer:</label>
          <input
            type="number"
            value={inputTimer}
            onChange={(e) => setInputTimer(Number(e.target.value))}
          />
          <button onClick={() => resetTimer(timeTimer - inputTimer)}>Remove</button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
