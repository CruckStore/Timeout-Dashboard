import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TimerContextValue {
  time: number;
  isRunning: boolean;
  mode: 'timer' | 'chrono';
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  setMode: (m: 'timer' | 'chrono') => void;
}

const TimerContext = createContext<TimerContextValue>({
  time: 0,
  isRunning: false,
  mode: 'timer',
  start: () => {},
  pause: () => {},
  reset: () => {},
  setMode: () => {},
});

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, _setMode] = useState<'timer' | 'chrono'>(() => {
    const stored = localStorage.getItem('globalMode');
    return stored === 'chrono' ? 'chrono' : 'timer';
  });

  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('globalMode', mode);
  }, [mode]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('timerUpdate', (data: { time: number; isRunning: boolean; mode: 'timer' | 'chrono' }) => {
      setTime(data.time);
      setIsRunning(data.isRunning);
      _setMode(data.mode);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const tick = () => {
    setTime((prevTime) => {
      let newTime = prevTime;
      if (mode === 'chrono') {
        newTime = prevTime + 1;
      } else {
        newTime = prevTime - 1;
        if (newTime <= 0) {
          newTime = 0;
          pause();
        }
      }
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true, mode });
      return newTime;
    });
  };

  const start = () => {
    if (isRunning) return;
    if (mode === 'timer' && time <= 0) return;

    setIsRunning(true);
    socketRef.current?.emit('toggleTimer', { isRunning: true, mode });
    intervalRef.current = setInterval(tick, 1000);
  };

  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    socketRef.current?.emit('toggleTimer', { isRunning: false, mode });
  };

  const reset = (newTime: number = 0) => {
    pause();
    setTime(newTime);
    socketRef.current?.emit('updateTimer', { time: newTime, isRunning: false, mode });
  };

  const setMode = (m: 'timer' | 'chrono') => {
    pause();
    _setMode(m);
    socketRef.current?.emit('updateTimer', { time, isRunning: false, mode: m });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TimerContext.Provider value={{ time, isRunning, mode, start, pause, reset, setMode }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
