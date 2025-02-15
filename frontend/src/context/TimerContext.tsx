import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [time, setTime] = useState(0);
  const [isRunning, setRunning] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

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

  const toggleTimer = () => {
    setRunning(!isRunning);
    socket?.emit('toggleTimer', { isRunning: !isRunning });
  };

  return (
    <TimerContext.Provider value={{ time, isRunning, updateTime, toggleTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
