// src/context/DualTimerContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface DualTimerContextProps {
  // Chrono (monte)
  timeChrono: number;
  isRunningChrono: boolean;
  startChrono: () => void;
  pauseChrono: () => void;
  resetChrono: (newTime?: number) => void;

  // Timer (descend)
  timeTimer: number;
  isRunningTimer: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newTime?: number) => void;
}

const DualTimerContext = createContext<DualTimerContextProps>({
  timeChrono: 0,
  isRunningChrono: false,
  startChrono: () => {},
  pauseChrono: () => {},
  resetChrono: () => {},
  timeTimer: 0,
  isRunningTimer: false,
  startTimer: () => {},
  pauseTimer: () => {},
  resetTimer: () => {},
});

export const DualTimerProvider = ({ children }: { children: React.ReactNode }) => {
  // État du Chrono
  const [timeChrono, setTimeChrono] = useState(0);
  const [isRunningChrono, setIsRunningChrono] = useState(false);
  const chronoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // État du Timer
  const [timeTimer, setTimeTimer] = useState(0);
  const [isRunningTimer, setIsRunningTimer] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Socket.IO (optionnel, pour synchro multi-clients)
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;
    socket.on('dualTimerUpdate', (data: any) => {
      if (typeof data.timeChrono === 'number') setTimeChrono(data.timeChrono);
      if (typeof data.isRunningChrono === 'boolean') setIsRunningChrono(data.isRunningChrono);
      if (typeof data.timeTimer === 'number') setTimeTimer(data.timeTimer);
      if (typeof data.isRunningTimer === 'boolean') setIsRunningTimer(data.isRunningTimer);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const emitUpdate = (partialData: any) => {
    const data = {
      timeChrono,
      isRunningChrono,
      timeTimer,
      isRunningTimer,
      ...partialData,
    };
    socketRef.current?.emit('dualTimerUpdate', data);
  };

  // --------------- Chrono ---------------
const startChrono = () => {
  console.log('startChrono called');
  if (isRunningChrono) return;
  setIsRunningChrono(true);

  chronoIntervalRef.current = setInterval(() => {
    console.log('Interval ticking...'); // <-- Ajoutez ce log
    setTimeChrono(prev => {
      const newTime = prev + 1;
      console.log('timeChrono passe à', newTime);
      emitUpdate({ timeChrono: newTime, isRunningChrono: true });
      return newTime;
    });
  }, 1000);

  emitUpdate({ isRunningChrono: true });
};


  const pauseChrono = () => {
    setIsRunningChrono(false);
    if (chronoIntervalRef.current) {
      clearInterval(chronoIntervalRef.current);
      chronoIntervalRef.current = null;
    }
    emitUpdate({ isRunningChrono: false });
  };

  const resetChrono = (newTime: number = 0) => {
    pauseChrono();
    setTimeChrono(newTime);
    emitUpdate({ timeChrono: newTime });
  };

  // --------------- Timer ---------------
  const startTimer = () => {
    console.log('startTimer called');
    if (isRunningTimer) return;
    if (timeTimer <= 0) {
      console.warn('Set Timer with a value > 0 before starting.');
      return;
    }
    setIsRunningTimer(true);
    timerIntervalRef.current = setInterval(() => {
      setTimeTimer(prev => {
        if (prev <= 1) {
          pauseTimer();
          emitUpdate({ timeTimer: 0, isRunningTimer: false });
          return 0;
        }
        const newTime = prev - 1;
        emitUpdate({ timeTimer: newTime, isRunningTimer: true });
        return newTime;
      });
    }, 1000);
    emitUpdate({ isRunningTimer: true });
  };

  const pauseTimer = () => {
    setIsRunningTimer(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    emitUpdate({ isRunningTimer: false });
  };

  const resetTimer = (newTime: number = 0) => {
    pauseTimer();
    setTimeTimer(newTime);
    emitUpdate({ timeTimer: newTime });
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      if (chronoIntervalRef.current) clearInterval(chronoIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <DualTimerContext.Provider
      value={{
        timeChrono,
        isRunningChrono,
        startChrono,
        pauseChrono,
        resetChrono,
        timeTimer,
        isRunningTimer,
        startTimer,
        pauseTimer,
        resetTimer,
      }}
    >
      {children}
    </DualTimerContext.Provider>
  );
};

export const useDualTimer = () => useContext(DualTimerContext);
