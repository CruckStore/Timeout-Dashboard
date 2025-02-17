import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import GlobalSettings from './pages/Emitter/GlobalSettings';

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;
