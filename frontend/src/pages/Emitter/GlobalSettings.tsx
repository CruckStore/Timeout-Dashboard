import React, { useState, useEffect } from 'react';
import { useTimer } from '../../context/TimerContext';

const GlobalSettings = () => {
  const { time, isRunning, start, pause, reset } = useTimer();
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
      <h2>Paramètres Globaux</h2>
      <p>Mode actuel : {mode === 'chrono' ? 'Chronomètre' : 'Compte à rebours'}</p>

      <div>
        <button onClick={() => (isRunning ? pause() : start())}>
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => reset(0)}>Reset</button>
      </div>

      <div>
        <label>Set Time:</label>
        <input
          type="number"
          value={inputTime}
          onChange={(e) => setInputTime(Number(e.target.value))}
        />
        <button onClick={() => reset(inputTime)}>Set</button>
      </div>

      <div>
        <label>Add Time:</label>
        <input
          type="number"
          value={inputTime}
          onChange={(e) => setInputTime(Number(e.target.value))}
        />
        <button onClick={() => reset(time + inputTime)}>Add</button>
      </div>

      <div>
        <label>Remove Time:</label>
        <input
          type="number"
          value={inputTime}
          onChange={(e) => setInputTime(Number(e.target.value))}
        />
        <button onClick={() => reset(time - inputTime)}>Remove</button>
      </div>

      <div>
        <p>Temps actuel : {time} s</p>
      </div>

      <div className="mode-selection">
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
