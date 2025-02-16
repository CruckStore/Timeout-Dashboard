import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TimerContextProps {
  time: number;
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
  const [isRunning, setRunning] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Initialisation de Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('timerUpdate', (data: { time: number; isRunning: boolean }) => {
      setTime(data.time);
      setRunning(data.isRunning);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const updateTime = (newTime: number) => {
    setTime(newTime);
    socket?.emit('updateTimer', { time: newTime, isRunning });
  };

  // Lorsque le timer est lancé, on réinitialise le temps à 0
  // Cela permet de "remettre à zéro" lors du passage de mode
  const toggleTimer = () => {
    setRunning(prev => {
      const newRunning = !prev;
      if (newRunning) {
        setTime(0); // Réinitialisation lors du démarrage
        lastUpdateRef.current = Date.now();
      }
      socket?.emit('toggleTimer', { isRunning: newRunning });
      return newRunning;
    });
  };

  // Vérification fréquente (tous les 250ms) pour mettre à jour le timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isRunning) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const delta = now - lastUpdateRef.current;
        if (delta >= 1000) {
          const secondsPassed = Math.floor(delta / 1000);
          // Récupération du mode : "chrono" (incrémente) ou "timer" (décrémente)
          const globalMode = localStorage.getItem('globalMode') || 'timer';
          setTime(prevTime => {
            let newTime: number;
            if (globalMode === 'chrono') {
              newTime = prevTime + secondsPassed;
            } else {
              newTime = prevTime - secondsPassed;
              if (newTime <= 0) {
                newTime = 0;
                setRunning(false);
                socket?.emit('toggleTimer', { isRunning: false });
              }
            }
            socket?.emit('updateTimer', { time: newTime, isRunning });
            lastUpdateRef.current = now;
            return newTime;
          });
        }
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, socket]);

  return (
    <TimerContext.Provider value={{ time, isRunning, updateTime, toggleTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
