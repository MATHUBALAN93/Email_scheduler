import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { authService } from './services/authService';
import { User } from './types';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScheduledPage from './pages/ScheduledPage';
import SentPage from './pages/SentPage';
import ComposePage from './pages/ComposePage';
import EmailDetailPage from './pages/EmailDetailPage';
import SendersPage from './pages/SendersPage';
import MainLayout from './layouts/MainLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Check for token in URL (Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      authService.setToken(token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {!user ? (
            <>
              <Route
                path="/login"
                element={
                  <LoginPage
                    onLogin={handleLogin}
                    onSwitchToRegister={() => window.location.href = '/register'}
                  />
                }
              />
              <Route
                path="/register"
                element={
                  <RegisterPage
                    onRegister={handleLogin}
                    onSwitchToLogin={() => window.location.href = '/login'}
                  />
                }
              />
              <Route
                path="*"
                element={<Navigate to="/login" replace />}
              />
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  <MainLayout
                    user={user}
                    onLogout={handleLogout}
                  />
                }
              >
                <Route
                  index
                  element={<Navigate to="/dashboard" replace />}
                />

                <Route
                  path="dashboard"
                  element={<DashboardPage />}
                />

                <Route
                  path="scheduled"
                  element={<ScheduledPage />}
                />

                <Route
                  path="sent"
                  element={<SentPage />}
                />

                <Route
                  path="senders"
                  element={<SendersPage />}
                />

                <Route
                  path="compose"
                  element={<ComposePage />}
                />

                <Route
                  path="emails/:id"
                  element={<EmailDetailPage />}
                />
              </Route>

              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;