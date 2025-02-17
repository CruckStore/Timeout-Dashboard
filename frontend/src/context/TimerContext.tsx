import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export type TimerMode = 'chrono' | 'timer';

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
  mode: 'timer',
  start: () => {},
  pause: () => {},
  reset: () => {},
  updateTime: () => {},
  setMode: () => {}
});

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>(() => {
    const stored = localStorage.getItem('globalMode');
    return stored === 'chrono' ? 'chrono' : 'timer';
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
    localStorage.setItem('globalMode', mode);
  }, [mode]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('timerUpdate', (data: { time: number; isRunning: boolean }) => {
      setTime(data.time);
      setIsRunning(data.isRunning);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const tick = () => {
    setTime(prev => {
      let newTime: number;
      if (modeRef.current === 'chrono') {
        newTime = prev + 1;
      } else {
        newTime = prev - 1;
      }
      if (modeRef.current === 'timer' && newTime <= 0) {
        newTime = 0;
        pause();
      }
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: modeRef.current === 'chrono' ? true : newTime > 0 });
      return newTime;
    });
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    socketRef.current?.emit('toggleTimer', { isRunning: true });
    intervalRef.current = setInterval(tick, 1000);
  };

  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    socketRef.current?.emit('toggleTimer', { isRunning: false });
  };

  const reset = (newTime: number = 0) => {
    pause();
    setTime(newTime);
    socketRef.current?.emit('updateTimer', { time: newTime, isRunning: false });
  };

  const updateTime = (newTime: number) => {
    setTime(newTime);
    socketRef.current?.emit('updateTimer', { time: newTime, isRunning });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TimerContext.Provider value={{ time, isRunning, mode, start, pause, reset, updateTime, setMode }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
