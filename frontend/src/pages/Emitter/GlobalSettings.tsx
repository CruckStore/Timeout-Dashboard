import { useState } from "react";
import { useTimer } from "../../context/TimerContext";

const TimerSettings = () => {
  const { time, start, pause, reset, updateTime, isRunning } = useTimer();
  const [timerSet, setTimerSet] = useState(0);
  const [timerAdd, setTimerAdd] = useState(0);
  const [timerRemove, setTimerRemove] = useState(0);

  return (
    <div className="timer-settings">
      <h3>Compte à rebours</h3>
      <div>
        <button onClick={isRunning ? pause : start}>
          {isRunning ? "Pause" : "Play"}
        </button>
        <button onClick={() => reset(0)}>Reset</button>
      </div>
      <div>
        <label>Set (Timer):</label>
        <input
          type="number"
          value={timerSet}
          onChange={(e) => setTimerSet(Number(e.target.value))}
        />
        <button onClick={() => updateTime(timerSet)}>Set</button>
      </div>
      <div>
        <label>Add (Timer):</label>
        <input
          type="number"
          value={timerAdd}
          onChange={(e) => setTimerAdd(Number(e.target.value))}
        />
        <button onClick={() => updateTime(time + timerAdd)}>Add</button>
      </div>
      <div>
        <label>Remove (Timer):</label>
        <input
          type="number"
          value={timerRemove}
          onChange={(e) => setTimerRemove(Number(e.target.value))}
        />
        <button onClick={() => updateTime(time - timerRemove)}>Remove</button>
      </div>
      <p>Temps actuel : {time} s</p>
    </div>
  );
};

const ChronoSettings = () => {
  const { time, start, pause, reset, updateTime, isRunning } = useTimer();
  const [chronoSet, setChronoSet] = useState(0);
  const [chronoAdd, setChronoAdd] = useState(0);
  const [chronoRemove, setChronoRemove] = useState(0);

  return (
    <div className="chrono-settings">
      <h3>Chronomètre</h3>
      <button onClick={isRunning ? pause : start}>
          {isRunning ? "Pause" : "Play"}
        </button>
      <button onClick={() => reset(0)}>Reset</button>
      <div>
        <label>Set (Chrono):</label>
        <input
          type="number"
          value={chronoSet}
          onChange={(e) => setChronoSet(Number(e.target.value))}
        />
        <button onClick={() => updateTime(chronoSet)}>Set</button>
      </div>
      <div>
        <label>Add (Chrono):</label>
        <input
          type="number"
          value={chronoAdd}
          onChange={(e) => setChronoAdd(Number(e.target.value))}
        />
        <button onClick={() => updateTime(time + chronoAdd)}>Add</button>
      </div>
      <div>
        <label>Remove (Chrono):</label>
        <input
          type="number"
          value={chronoRemove}
          onChange={(e) => setChronoRemove(Number(e.target.value))}
        />
        <button onClick={() => updateTime(time - chronoRemove)}>Remove</button>
      </div>
      <p>Temps actuel : {time} s</p>
    </div>
  );
};

const GlobalSettings = () => {
  const { mode, setMode } = useTimer();

  const handleModeChange = (newMode: "timer" | "chrono") => {
    setMode(newMode);
  };

  return (
    <div className="card global-settings">
      <h2>Global</h2>
      <div className="mode-selection">
        <p>Sélectionnez l'affichage:</p>
        <label>
          <input
            type="radio"
            value="timer"
            checked={mode === "timer"}
            onChange={() => handleModeChange("timer")}
          />
          Timer (Compte à rebours)
        </label>
        <label>
          <input
            type="radio"
            value="chrono"
            checked={mode === "chrono"}
            onChange={() => handleModeChange("chrono")}
          />
          Chrono (Chronomètre)
        </label>
      </div>
      {mode === "timer" ? <TimerSettings /> : <ChronoSettings />}
    </div>
  );
};

export default GlobalSettings;
