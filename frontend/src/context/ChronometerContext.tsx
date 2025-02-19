import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface ChronometerContextProps {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  updateTime: (newTime: number) => void;
}

const ChronometerContext = createContext<ChronometerContextProps>({
  time: 0,
  isRunning: false,
  start: () => {},
  stop: () => {},
  reset: () => {},
  updateTime: () => {},
});

export const ChronometerProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stop();
    setTime(0);
  };

  const updateTime = (newTime: number) => {
    setTime(newTime);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ChronometerContext.Provider
      value={{ time, isRunning, start, stop, reset, updateTime }}
    >
      {children}
    </ChronometerContext.Provider>
  );
};

export const useChronometer = () => useContext(ChronometerContext);