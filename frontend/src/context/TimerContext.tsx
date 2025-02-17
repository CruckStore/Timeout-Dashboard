// src/context/TimerContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export type TimerMode = 'chrono' | 'timer';

interface TimerContextProps {
  // "time" renvoie le temps du mode actif
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
  // Deux états distincts pour chacun des modes
  const [chronoTime, setChronoTime] = useState<number>(0);
  const [timerTime, setTimerTime] = useState<number>(0);

  // isRunning et mode restent globaux
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>(() => {
    const stored = localStorage.getItem('globalMode');
    return stored === 'chrono' ? 'chrono' : 'timer';
  });

  // La valeur "time" exposée correspond au temps du mode actif
  const time = mode === 'chrono' ? chronoTime : timerTime;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Utilisation d'une ref pour disposer de la dernière valeur de mode dans tick
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
    localStorage.setItem('globalMode', mode);
  }, [mode]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('timerUpdate', (data: { time: number; isRunning: boolean }) => {
      // On met à jour uniquement la valeur du mode actif
      if (modeRef.current === 'chrono') {
        setChronoTime(data.time);
      } else {
        setTimerTime(data.time);
      }
      setIsRunning(data.isRunning);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const tick = () => {
    if (modeRef.current === 'chrono') {
      setChronoTime(prev => {
        const newTime = prev + 1;
        socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true });
        return newTime;
      });
    } else {
      setTimerTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          pause();
          socketRef.current?.emit('updateTimer', { time: 0, isRunning: false });
          return 0;
        }
        socketRef.current?.emit('updateTimer', { time: newTime, isRunning: true });
        return newTime;
      });
    }
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
    if (modeRef.current === 'chrono') {
      setChronoTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: false });
    } else {
      setTimerTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning: false });
    }
  };

  const updateTime = (newTime: number) => {
    if (modeRef.current === 'chrono') {
      setChronoTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning });
    } else {
      setTimerTime(newTime);
      socketRef.current?.emit('updateTimer', { time: newTime, isRunning });
    }
  };

  // Nouvelle fonction pour changer de mode en s'assurant que le timer est arrêté
  const changeMode = (newMode: TimerMode) => {
    if (isRunning) {
      pause();
    }
    // Met à jour immédiatement la ref pour que tick() utilise le bon mode
    modeRef.current = newMode;
    setMode(newMode);
    
    // Récupère la valeur de temps propre au nouveau mode
    const newTime = newMode === 'chrono' ? chronoTime : timerTime;
    // Met à jour le serveur avec le temps correspondant au nouveau mode
    socketRef.current?.emit('updateTimer', { time: newTime, isRunning: false });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TimerContext.Provider
      value={{ time, isRunning, mode, start, pause, reset, updateTime, setMode: changeMode }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
