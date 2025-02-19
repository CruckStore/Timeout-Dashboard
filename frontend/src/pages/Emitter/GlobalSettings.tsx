import React, { useState, useEffect } from "react";
import { useTimer } from "../../context/TimerContext";

const GlobalSettings = () => {
  const { time, start, pause, reset, updateTime, isRunning, mode, setMode } =
    useTimer();

  const [chronoSet, setChronoSet] = useState<number>(() => {
    const stored = localStorage.getItem("chronoSet");
    return stored ? Number(stored) : 0;
  });
  const [chronoAdd, setChronoAdd] = useState<number>(() => {
    const stored = localStorage.getItem("chronoAdd");
    return stored ? Number(stored) : 0;
  });
  const [chronoRemove, setChronoRemove] = useState<number>(() => {
    const stored = localStorage.getItem("chronoRemove");
    return stored ? Number(stored) : 0;
  });
  const [timerSet, setTimerSet] = useState<number>(() => {
    const stored = localStorage.getItem("timerSet");
    return stored ? Number(stored) : 0;
  });
  const [timerAdd, setTimerAdd] = useState<number>(() => {
    const stored = localStorage.getItem("timerAdd");
    return stored ? Number(stored) : 0;
  });
  const [timerRemove, setTimerRemove] = useState<number>(() => {
    const stored = localStorage.getItem("timerRemove");
    return stored ? Number(stored) : 0;
  });

  const [displayMode, setDisplayMode] = useState<"timer" | "chrono">(() => {
    const stored = localStorage.getItem("displayMode");
    return stored === "timer" ? "timer" : "chrono";
  });

  useEffect(() => {
    localStorage.setItem("chronoSet", String(chronoSet));
  }, [chronoSet]);
  useEffect(() => {
    localStorage.setItem("chronoAdd", String(chronoAdd));
  }, [chronoAdd]);
  useEffect(() => {
    localStorage.setItem("chronoRemove", String(chronoRemove));
  }, [chronoRemove]);
  useEffect(() => {
    localStorage.setItem("timerSet", String(timerSet));
  }, [timerSet]);
  useEffect(() => {
    localStorage.setItem("timerAdd", String(timerAdd));
  }, [timerAdd]);
  useEffect(() => {
    localStorage.setItem("timerRemove", String(timerRemove));
  }, [timerRemove]);
  useEffect(() => {
    localStorage.setItem("displayMode", displayMode);
  }, [displayMode]);

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
        {displayMode === "chrono" ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
        )}

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
            checked={displayMode === "timer"}
            onChange={() => setDisplayMode("timer")}
          />
          Timer (Compte à rebours)
        </label>
        <label>
          <input
            type="radio"
            value="chrono"
            checked={displayMode === "chrono"}
            onChange={() => setDisplayMode("chrono")}
          />
          Chrono (Chronomètre)
        </label>
      </div>
    </div>
  );
};

export default GlobalSettings;
