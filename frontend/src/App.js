import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { AuthGuard } from './gaurd/auth-gaurd';

// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
// layouts
import DashboardLayout from './layouts/dashboard';
import LoginPage from './pages/auth/LoginPage';

import Account from './pages/account/account';
import { KanbanView } from './pages/kanban/view'

function App() {
  return (
    <HelmetProvider>
        <Router>
          <ThemeProvider>
            <ScrollToTop />
            <AuthProvider>
                <Routes>
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route 
                    path="/" 
                    element={
                      <AuthGuard>
                        <DashboardLayout><KanbanView /> </DashboardLayout>
                      </AuthGuard>
                    } 
                  />
                  <Route
                    path="/account/*"
                    element={
                      <AuthGuard>
                        <DashboardLayout>
                          <Routes>
                            <Route path="/" element={<Account />} />
                            <Route path=":accountVar" element={<Account />} />
                          </Routes>
                        </DashboardLayout>
                      </AuthGuard>
                    }
                  />
                </Routes>
            </AuthProvider>
          </ThemeProvider>
        </Router>
    </HelmetProvider>
  );
}

export default App;
