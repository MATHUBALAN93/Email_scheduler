import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { authService } from './services/authService';
import { User } from './types';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScheduledPage from './pages/ScheduledPage';
import SentPage from './pages/SentPage';
import ComposePage from './pages/ComposePage';
import EmailDetailPage from './pages/EmailDetailPage';
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
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   checkAuth();
  // }, []);

  const checkAuth = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
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
        {!user ? (
          <Routes>
            <Route
              path="/login"
              element={<LoginPage onLogin={checkAuth} />}
            />
            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </Routes>
        ) : (
          <Routes>
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
          </Routes>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;