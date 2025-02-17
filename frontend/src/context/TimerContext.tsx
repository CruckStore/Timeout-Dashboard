import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TimerContextValue {
  time: number;                           // Le temps en secondes
  isRunning: boolean;                     // Le timer est-il en cours ?
  mode: 'timer' | 'chrono';               // Mode global : compte à rebours ou chrono
  start: () => void;                      // Démarrer (ou reprendre)
  pause: () => void;                      // Mettre en pause
  reset: (newTime?: number) => void;      // Réinitialiser à une valeur
  setMode: (m: 'timer' | 'chrono') => void; // Changer le mode
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
  // Mode par défaut : on lit le localStorage au montage
  const [mode, _setMode] = useState<'timer' | 'chrono'>(() => {
    const stored = localStorage.getItem('globalMode');
    return stored === 'chrono' ? 'chrono' : 'timer';
  });

  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // -- 1) Stocker le mode dans localStorage dès qu'il change
  useEffect(() => {
    localStorage.setItem('globalMode', mode);
  }, [mode]);

  // -- 2) Connexion Socket.IO unique
  useEffect(() => {
    const socket = io('http://localhost:5000'); // Adaptez l'URL selon votre backend
    socketRef.current = socket;

    // Lorsqu'on reçoit une mise à jour du timer depuis le serveur
    socket.on('timerUpdate', (data: { time: number; isRunning: boolean; mode: 'timer' | 'chrono' }) => {
      setTime(data.time);
      setIsRunning(data.isRunning);
      _setMode(data.mode);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // -- 3) Fonction appelée chaque seconde si isRunning = true
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
      // Émettre la mise à jour vers le serveur
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true, mode });
      return newTime;
    });
  };

  // -- 4) start : Démarrer ou reprendre le timer
  const start = () => {
    if (isRunning) return; // déjà en cours
    // En mode timer, on ne démarre que si time > 0
    if (mode === 'timer' && time <= 0) return;

    setIsRunning(true);
    socketRef.current?.emit('toggleTimer', { isRunning: true, mode });
    // Lance l'intervalle toutes les secondes
    intervalRef.current = setInterval(tick, 1000);
  };

  // -- 5) pause : Mettre en pause
  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    socketRef.current?.emit('toggleTimer', { isRunning: false, mode });
  };

  // -- 6) reset : Réinitialiser le temps
  const reset = (newTime: number = 0) => {
    pause();
    setTime(newTime);
    socketRef.current?.emit('updateTimer', { time: newTime, isRunning: false, mode });
  };

  // -- 7) setMode : changer le mode (chrono ou timer)
  const setMode = (m: 'timer' | 'chrono') => {
    pause();
    _setMode(m);
    // On émet pour que le serveur sache aussi quel mode est sélectionné (optionnel)
    socketRef.current?.emit('updateTimer', { time, isRunning: false, mode: m });
  };

  // -- Nettoyage : si le composant se démonte, on arrête l'intervalle
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // On expose dans le context
  return (
    <TimerContext.Provider value={{ time, isRunning, mode, start, pause, reset, setMode }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
