import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface DualTimerContextProps {
  // Chronomètre (compteur qui monte)
  timeChrono: number;
  isRunningChrono: boolean;
  startChrono: () => void;
  pauseChrono: () => void;
  resetChrono: (newTime?: number) => void;
  // Timer (compteur qui descend)
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
  // Chronomètre : compteur qui monte
  const [timeChrono, setTimeChrono] = useState<number>(0);
  const [isRunningChrono, setIsRunningChrono] = useState<boolean>(false);
  const chronoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer : compteur qui descend
  const [timeTimer, setTimeTimer] = useState<number>(0);
  const [isRunningTimer, setIsRunningTimer] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Socket unique pour la synchronisation (émetteur/récepteurs)
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

  // Fonction d'émission : on envoie l'état complet afin de synchroniser tous les clients
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

  // ================= Chronomètre (compteur qui monte) =================
  const startChrono = () => {
    if (isRunningChrono) return;
    setIsRunningChrono(true);
    chronoIntervalRef.current = setInterval(() => {
      setTimeChrono(prev => {
        const newTime = prev + 1;
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

  // ================= Timer (compteur qui descend) =================
  const startTimer = () => {
    if (isRunningTimer) return;
    if (timeTimer <= 0) return; // ne démarre pas si le temps est nul
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
