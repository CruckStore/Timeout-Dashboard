import React, { useState, useEffect } from 'react';
import { useDualTimer } from '../../context/DualTimerContext';

const GlobalSettings = () => {
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
    resetTimer,
  } = useDualTimer();

  // Inputs pour modifier chacun des compteurs
  const [inputChrono, setInputChrono] = useState<number>(0);
  const [inputTimer, setInputTimer] = useState<number>(0);

  // Choix de l'affichage à envoyer aux récepteurs
  const [displayMode, setDisplayMode] = useState<'chrono' | 'timer'>(() => {
    const stored = localStorage.getItem('displayMode');
    return stored === 'timer' ? 'timer' : 'chrono';
  });

  useEffect(() => {
    localStorage.setItem('displayMode', displayMode);
  }, [displayMode]);

  return (
    <div className="card global-settings">
      <h2>Global Settings</h2>
      <div className="settings-container">
        {/* Bloc Chrono */}
        <div className="chrono-section">
          <h3>CHRONO (Count Up)</h3>
          <p>Temps Chrono : {timeChrono} s</p>
          <div>
            <button onClick={() => (isRunningChrono ? pauseChrono() : startChrono())}>
              {isRunningChrono ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => resetChrono(0)}>Reset</button>
          </div>
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

        {/* Bloc Timer */}
        <div className="timer-section">
          <h3>TIMER (Count Down)</h3>
          <p>Temps Timer : {timeTimer} s</p>
          <div>
            <button onClick={() => (isRunningTimer ? pauseTimer() : startTimer())}>
              {isRunningTimer ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => resetTimer(0)}>Reset</button>
          </div>
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

      {/* Boutons radio pour choisir l'affichage envoyé aux récepteurs */}
      <div className="display-mode-selection">
        <p>Sélectionnez l'affichage pour TimerDisplay :</p>
        <label>
          <input
            type="radio"
            value="chrono"
            checked={displayMode === 'chrono'}
            onChange={() => setDisplayMode('chrono')}
          />
          Chrono
        </label>
        <label>
          <input
            type="radio"
            value="timer"
            checked={displayMode === 'timer'}
            onChange={() => setDisplayMode('timer')}
          />
          Timer
        </label>
      </div>
    </div>
  );
};

export default GlobalSettings;
