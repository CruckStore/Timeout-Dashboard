import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ReceiverHome from '../pages/Receiver/ReceiverHome';
import MainScreen from '../pages/Receiver/MainScreen';
import SecondaryScreen from '../pages/Receiver/SecondaryScreen';
import Countdown from '../pages/Receiver/Countdown';
import EmitterSettings from '../pages/Emitter/EmitterSettings';
import NotFound from '../pages/NotFound';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
  }

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  };

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      {/* Receiver routes */}
      <Route path="/receiver" element={<PrivateRoute><ReceiverHome /></PrivateRoute>} />
      <Route path="/receiver/main" element={<PrivateRoute><MainScreen /></PrivateRoute>} />
      <Route path="/receiver/secondary" element={<PrivateRoute><SecondaryScreen /></PrivateRoute>} />
      <Route path="/receiver/countdown" element={<PrivateRoute><Countdown /></PrivateRoute>} />
      {/* Emitter routes */}
      <Route path="/emitter" element={<PrivateRoute><EmitterSettings /></PrivateRoute>} />
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
