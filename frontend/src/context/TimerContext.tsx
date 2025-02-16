import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TimerContextProps {
  time: number; // temps en secondes
  isRunning: boolean;
  updateTime: (newTime: number) => void;
  toggleTimer: () => void;
}

const TimerContext = createContext<TimerContextProps>({
  time: 0,
  isRunning: false,
  updateTime: () => {},
  toggleTimer: () => {}
});

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Pour le mode "chrono", on stocke l'instant de départ (en ms)
  const startTimestampRef = useRef<number>(0);
  // Pour le mode "timer" (compte à rebours), on stocke l'instant cible (en ms)
  const endTimestampRef = useRef<number>(0);
  // Référence pour stocker l'ID du timeout en cours
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialisation de la connexion Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('timerUpdate', (data: { time: number; isRunning: boolean }) => {
      setTime(data.time);
      setIsRunning(data.isRunning);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Permet d'annuler le timeout en cours
  const clearTick = () => {
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }
  };

  // Fonction de tick qui se programme elle-même pour s'aligner sur le bord de seconde
  const tick = () => {
    if (!isRunning) return;
    const now = Date.now();
    const mode = localStorage.getItem('globalMode') || 'timer';
    let newTime: number;

    if (mode === 'chrono') {
      newTime = Math.floor((now - startTimestampRef.current) / 1000);
    } else {
      newTime = Math.max(Math.floor((endTimestampRef.current - now) / 1000), 0);
    }

    setTime(newTime);
    socket?.emit('updateTimer', { time: newTime, isRunning });

    // En mode compte à rebours, on arrête dès que 0 est atteint
    if (mode === 'timer' && newTime <= 0) {
      setIsRunning(false);
      socket?.emit('toggleTimer', { isRunning: false });
      return;
    }

    // Calculer le délai jusqu'au prochain bord de seconde
    const delay = 1000 - (now % 1000);
    tickTimeoutRef.current = setTimeout(tick, delay);
  };

  // Démarrer ou arrêter le timer
  const toggleTimer = () => {
    if (isRunning) {
      // Arrêter le timer
      setIsRunning(false);
      clearTick();
      socket?.emit('toggleTimer', { isRunning: false });
    } else {
      // Démarrer le timer
      const mode = localStorage.getItem('globalMode') || 'timer';
      if (mode === 'chrono') {
        // Pour le chrono, on part de l'instant actuel en déduisant le temps déjà écoulé (si modifié)
        startTimestampRef.current = Date.now() - time * 1000;
      } else {
        // Pour le compte à rebours, on fixe la cible à l'instant actuel + le temps restant
        endTimestampRef.current = Date.now() + time * 1000;
      }
      setIsRunning(true);
      socket?.emit('toggleTimer', { isRunning: true });
      // Démarrer le tick en s'alignant sur le prochain bord de seconde
      const now = Date.now();
      const delay = 1000 - (now % 1000);
      tickTimeoutRef.current = setTimeout(tick, delay);
    }
  };

  // Mettre à jour manuellement le temps et réinitialiser le tick si le timer est en marche
  const updateTime = (newTime: number) => {
    clearTick();
    setTime(newTime);
    const mode = localStorage.getItem('globalMode') || 'timer';
    if (isRunning) {
      if (mode === 'chrono') {
        startTimestampRef.current = Date.now() - newTime * 1000;
      } else {
        endTimestampRef.current = Date.now() + newTime * 1000;
      }
      const now = Date.now();
      const delay = 1000 - (now % 1000);
      tickTimeoutRef.current = setTimeout(tick, delay);
    }
    socket?.emit('updateTimer', { time: newTime, isRunning });
  };

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      clearTick();
    };
  }, []);

  return (
    <TimerContext.Provider value={{ time, isRunning, updateTime, toggleTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
