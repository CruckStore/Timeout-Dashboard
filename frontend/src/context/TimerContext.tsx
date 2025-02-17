import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface TimerContextProps {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
}

const TimerContext = createContext<TimerContextProps>({
  time: 0,
  isRunning: false,
  start: () => {},
  pause: () => {},
  reset: () => {}
});

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const startTimestampRef = useRef<number>(0);
  const endTimestampRef = useRef<number>(0);

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
    const mode = localStorage.getItem('globalMode') || 'timer';

    if (mode === 'chrono') {
      const newTime = Math.floor((Date.now() - startTimestampRef.current) / 1000);
      setTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true });
    } else {
      const newTime = Math.max(0, Math.floor((endTimestampRef.current - Date.now()) / 1000));
      setTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true });
      if (newTime <= 0) {
        pause();
      }
    }
  };

  const start = () => {
    if (isRunning) return;
    const mode = localStorage.getItem('globalMode') || 'timer';

    if (mode === 'chrono') {
      startTimestampRef.current = Date.now() - time * 1000;
    } else {
      if (time <= 0) return;
      endTimestampRef.current = Date.now() + time * 1000;
    }
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TimerContext.Provider value={{ time, isRunning, start, pause, reset }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
