import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface DualTimerContextProps {
  // Chronomètre (incrémente)
  timeChrono: number;
  isRunningChrono: boolean;
  startChrono: () => void;
  pauseChrono: () => void;
  resetChrono: (newTime?: number) => void;

  // Timer (décrémente)
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
  resetTimer: () => {}
});

export const DualTimerProvider = ({ children }: { children: React.ReactNode }) => {
  // -- Chronomètre --
  const [timeChrono, setTimeChrono] = useState<number>(0);
  const [isRunningChrono, setIsRunningChrono] = useState<boolean>(false);
  const chronoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // -- Timer --
  const [timeTimer, setTimeTimer] = useState<number>(0);
  const [isRunningTimer, setIsRunningTimer] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Socket unique pour synchroniser tout
  const socketRef = useRef<Socket | null>(null);

  // ---------------------------------------------------
  // 1. INITIALISATION DE LA SOCKET
  // ---------------------------------------------------
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    // Lorsque le serveur émet un "dualTimerUpdate", on met à jour localement
    socket.on('dualTimerUpdate', (data: any) => {
      setTimeChrono(data.timeChrono);
      setIsRunningChrono(data.isRunningChrono);
      setTimeTimer(data.timeTimer);
      setIsRunningTimer(data.isRunningTimer);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ---------------------------------------------------
  // 2. CHRONOMÈTRE : start/pause/reset
  // ---------------------------------------------------
  const startChrono = () => {
    if (isRunningChrono) return; // déjà en cours
    setIsRunningChrono(true);
    // Lancement d'un intervalle qui incrémente chaque seconde
    chronoIntervalRef.current = setInterval(() => {
      setTimeChrono(prev => {
        const newTime = prev + 1;
        emitDualTimerUpdate({ timeChrono: newTime, isRunningChrono: true });
        return newTime;
      });
    }, 1000);

    // Émission socket
    emitDualTimerUpdate({ isRunningChrono: true });
  };

  const pauseChrono = () => {
    setIsRunningChrono(false);
    if (chronoIntervalRef.current) {
      clearInterval(chronoIntervalRef.current);
      chronoIntervalRef.current = null;
    }
    // Émission socket
    emitDualTimerUpdate({ isRunningChrono: false });
  };

  const resetChrono = (newTime: number = 0) => {
    pauseChrono(); // Arrête le chrono
    setTimeChrono(newTime);
    // Émission socket
    emitDualTimerUpdate({ timeChrono: newTime });
  };

  // ---------------------------------------------------
  // 3. TIMER (compte à rebours) : start/pause/reset
  // ---------------------------------------------------
  const startTimer = () => {
    if (isRunningTimer) return; // déjà en cours
    if (timeTimer <= 0) return; // rien à décrémenter
    setIsRunningTimer(true);
    // Lancement d'un intervalle qui décrémente chaque seconde
    timerIntervalRef.current = setInterval(() => {
      setTimeTimer(prev => {
        if (prev <= 1) {
          // Arrivé à 0 => on arrête
          pauseTimer();
          return 0;
        }
        const newTime = prev - 1;
        emitDualTimerUpdate({ timeTimer: newTime, isRunningTimer: true });
        return newTime;
      });
    }, 1000);

    // Émission socket
    emitDualTimerUpdate({ isRunningTimer: true });
  };

  const pauseTimer = () => {
    setIsRunningTimer(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Émission socket
    emitDualTimerUpdate({ isRunningTimer: false });
  };

  const resetTimer = (newTime: number = 0) => {
    pauseTimer(); // Arrête le timer
    setTimeTimer(newTime);
    // Émission socket
    emitDualTimerUpdate({ timeTimer: newTime });
  };

  // ---------------------------------------------------
  // 4. Émettre l'état complet via Socket.IO
  // ---------------------------------------------------
  const emitDualTimerUpdate = (partialData: any) => {
    // Récupère l'état actuel + la partialData pour émettre un snapshot complet
    const newData = {
      timeChrono,
      isRunningChrono,
      timeTimer,
      isRunningTimer,
      ...partialData
    };
    socketRef.current?.emit('dualTimerUpdate', newData);
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      if (chronoIntervalRef.current) clearInterval(chronoIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // ---------------------------------------------------
  // 5. Rendu du Provider
  // ---------------------------------------------------
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
        resetTimer
      }}
    >
      {children}
    </DualTimerContext.Provider>
  );
};

export const useDualTimer = () => useContext(DualTimerContext);
