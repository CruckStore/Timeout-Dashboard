import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface TimerContextProps {
  time: number;         // Temps affiché en secondes
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
  reset: () => {},
});

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Pour le mode "chrono" : on mémorise l'instant de départ (en ms)
  // Pour le mode "timer" : on mémorise l'instant auquel le compte à rebours doit se terminer (en ms)
  const startTimestampRef = useRef<number>(0);
  const endTimestampRef = useRef<number>(0);

  // Initialisation de Socket.IO
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

  // La fonction tick est appelée chaque seconde
  const tick = () => {
    const mode = localStorage.getItem('globalMode') || 'timer';
    if (mode === 'chrono') {
      const newTime = Math.floor((Date.now() - startTimestampRef.current) / 1000);
      setTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true });
    } else {
      // Mode timer : on calcule le temps restant (en s)
      const newTime = Math.max(0, Math.floor((endTimestampRef.current - Date.now()) / 1000));
      setTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true });
      if (newTime === 0) {
        pause();
      }
    }
  };

  // Démarrer ou reprendre le timer/chronomètre sans réinitialiser le temps en cas de pause
  const start = () => {
    if (isRunning) return; // déjà en cours
    const mode = localStorage.getItem('globalMode') || 'timer';
    if (mode === 'chrono') {
      // Pour le chrono, si le temps est déjà > 0, on reprend à partir du temps actuel
      // Sinon, on démarre à 0
      startTimestampRef.current = Date.now() - time * 1000;
    } else {
      // Pour le timer, on reprend le compte à rebours en recalculant l'échéance à partir du temps restant
      if (time <= 0) return; // Ne démarre pas si aucun temps n'est défini
      endTimestampRef.current = Date.now() + time * 1000;
    }
    setIsRunning(true);
    socketRef.current?.emit('toggleTimer', { isRunning: true });
    // Démarre un intervalle qui met à jour le temps chaque seconde
    intervalRef.current = setInterval(tick, 1000);
  };

  // La fonction pause met simplement en pause le fonctionnement sans réinitialiser le temps
  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    socketRef.current?.emit('toggleTimer', { isRunning: false });
  };

  // reset réinitialise le timer (et arrête le timer si en cours)
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
