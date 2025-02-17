import React, { useState } from "react";
import { useTimer } from "../../context/TimerContext";

const GlobalSettings = () => {
  const { time, start, pause, reset, updateTime, isRunning, mode, setMode } =
    useTimer();
  const [inputTime, setInputTime] = useState<number>(0);

  return (
    <div className="card global-settings">
      <h2>Global</h2>
      <div className="chrono-settings">
        <p>{mode === "chrono" ? "Chronomètre" : "Compte à rebours"}</p>
        <div>
          <button onClick={isRunning ? pause : start}>
            {isRunning ? "Pause" : "Play"}
          </button>
          <button onClick={() => reset(0)}>Reset</button>
        </div>
        <div>
          <label>Set:</label>
          <input
            type="number"
            value={inputTime}
            onChange={(e) => setInputTime(Number(e.target.value))}
          />
          <button onClick={() => updateTime(inputTime)}>Set</button>
        </div>
        <div>
          <label>Add:</label>
          <input
            type="number"
            value={inputTime}
            onChange={(e) => setInputTime(Number(e.target.value))}
          />
          <button onClick={() => updateTime(time + inputTime)}>Add</button>
        </div>
        <div>
          <label>Remove:</label>
          <input
            type="number"
            value={inputTime}
            onChange={(e) => setInputTime(Number(e.target.value))}
          />
          <button onClick={() => updateTime(time - inputTime)}>Remove</button>
        </div>
        <div>
          <p>Temps actuel : {time} s</p>
        </div>
      </div>
      <div className="mode-selection">
        <p>Sélectionnez l'affichage:</p>
        <label>
          <input
            type="radio"
            value="timer"
            checked={mode === "timer"}
            onChange={() => setMode("timer")}
          />
          Timer (Compte à rebours)
        </label>
        <label>
          <input
            type="radio"
            value="chrono"
            checked={mode === "chrono"}
            onChange={() => setMode("chrono")}
          />
          Chrono (Chronomètre)
        </label>
      </div>
    </div>
  );
};

export default GlobalSettings;
