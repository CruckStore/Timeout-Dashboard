import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TimerContextProps {
  time: number;           
  isRunning: boolean;
  start: () => void;      
  pause: () => void;      
  reset: (newTime?: number) => void;
  updateTime: (newTime: number) => void;
}

const TimerContext = createContext<TimerContextProps>({
  time: 0,
  isRunning: false,
  start: () => {},
  pause: () => {},
  reset: () => {},
  updateTime: () => {}
});

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

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
      const newTime = prev + 1;
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true });
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
    <TimerContext.Provider value={{ time, isRunning, start, pause, reset, updateTime }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
