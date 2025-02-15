import React, { useState, useEffect } from 'react';
import { useTimer } from '../../context/TimerContext';

const GlobalSettings = () => {
  const { time, updateTime, toggleTimer, isRunning } = useTimer();
  const [inputTime, setInputTime] = useState<number>(0);
  const [mode, setMode] = useState<'timer' | 'chrono'>(() => {
    const stored = localStorage.getItem('globalMode');
    return stored === 'chrono' ? 'chrono' : 'timer';
  });

  useEffect(() => {
    localStorage.setItem('globalMode', mode);
  }, [mode]);

  return (
    <div className="card global-settings">
      <h2>Global</h2>
      <div className="chrono-settings">
        <p>Chrono</p>
        <button onClick={toggleTimer}>{isRunning ? 'Stop' : 'Play'}</button>
        <div>
          <label>Set:</label>
          <input type="number" value={inputTime} onChange={(e) => setInputTime(Number(e.target.value))} />
          <button onClick={() => updateTime(inputTime)}>Set</button>
        </div>
        <div>
          <label>Add:</label>
          <input type="number" value={inputTime} onChange={(e) => setInputTime(Number(e.target.value))} />
          <button onClick={() => updateTime(time + inputTime)}>Add</button>
        </div>
        <div>
          <label>Remove:</label>
          <input type="number" value={inputTime} onChange={(e) => setInputTime(Number(e.target.value))} />
          <button onClick={() => updateTime(time - inputTime)}>Remove</button>
        </div>
      </div>
      <div className="mode-selection">
        <p>Sélectionnez l'affichage:</p>
        <label>
          <input
            type="radio"
            value="timer"
            checked={mode === 'timer'}
            onChange={() => setMode('timer')}
          />
          Timer
        </label>
        <label>
          <input
            type="radio"
            value="chrono"
            checked={mode === 'chrono'}
            onChange={() => setMode('chrono')}
          />
          Chrono
        </label>
      </div>
    </div>
  );
};

export default GlobalSettings;
