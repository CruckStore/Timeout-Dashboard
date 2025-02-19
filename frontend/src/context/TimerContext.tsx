import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";

export type TimerMode = "chrono" | "timer";

interface TimerContextProps {
  time: number;
  isRunning: boolean;
  mode: TimerMode;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  updateTime: (newTime: number) => void;
  setMode: (newMode: TimerMode) => void;
}

const TimerContext = createContext<TimerContextProps>({
  time: 0,
  isRunning: false,
  mode: "timer",
  start: () => {},
  pause: () => {},
  reset: () => {},
  updateTime: () => {},
  setMode: () => {},
});

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [chronoTime, setChronoTime] = useState<number>(0);
  const [timerTime, setTimerTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>(() => {
    const stored = localStorage.getItem("globalMode");
    return stored === "chrono" ? "chrono" : "timer";
  });

  const time = mode === "chrono" ? chronoTime : timerTime;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
    localStorage.setItem("globalMode", mode);
  }, [mode]);

  useEffect(() => {
    const socket = io("http://82.153.202.154:5000");
    socketRef.current = socket;

    socket.on("timerUpdate", (data: { time: number; isRunning: boolean }) => {
      if (modeRef.current === "chrono") {
        setChronoTime(data.time);
      } else {
        setTimerTime(data.time);
      }
      setIsRunning(data.isRunning);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const tick = () => {
    if (modeRef.current === "chrono") {
      setChronoTime((prev) => {
        const newTime = prev + 1;
        socketRef.current?.emit("updateTimer", {
          time: newTime,
          isRunning: true,
        });
        return newTime;
      });
    } else {
      setTimerTime((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          pause();
          socketRef.current?.emit("updateTimer", { time: 0, isRunning: false });
          return 0;
        }
        socketRef.current?.emit("updateTimer", {
          time: newTime,
          isRunning: true,
        });
        return newTime;
      });
    }
  };

  const start = () => {
    if (isRunning) return;
    if (modeRef.current === "timer" && timerTime <= 0) {
      alert("Veuillez définir une valeur positive pour le compte à rebours.");
      return;
    }
    setIsRunning(true);
    socketRef.current?.emit("toggleTimer", { isRunning: true });
    intervalRef.current = setInterval(tick, 1000);
  };

  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    socketRef.current?.emit("toggleTimer", { isRunning: false });
  };

  const reset = (newTime: number = 0) => {
    pause();
    if (modeRef.current === "chrono") {
      setChronoTime(newTime);
      socketRef.current?.emit("updateTimer", {
        time: newTime,
        isRunning: false,
      });
    } else {
      setTimerTime(newTime);
      socketRef.current?.emit("updateTimer", {
        time: newTime,
        isRunning: false,
      });
    }
  };

  const updateTime = (newTime: number) => {
    if (modeRef.current === "chrono") {
      setChronoTime(newTime);
      socketRef.current?.emit("updateTimer", { time: newTime, isRunning });
    } else {
      setTimerTime(newTime);
      socketRef.current?.emit("updateTimer", { time: newTime, isRunning });
    }
  };

  const changeMode = (newMode: TimerMode) => {
    if (isRunning) pause();
    modeRef.current = newMode;
    setMode(newMode);
    const newTime = newMode === "chrono" ? chronoTime : timerTime;
    socketRef.current?.emit("updateTimer", { time: newTime, isRunning: false });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TimerContext.Provider
      value={{
        time,
        isRunning,
        mode,
        start,
        pause,
        reset,
        updateTime,
        setMode: changeMode,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
