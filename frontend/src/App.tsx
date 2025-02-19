import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { ChronometerProvider } from './context/ChronometerContext';

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <ChronometerProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ChronometerProvider>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;
