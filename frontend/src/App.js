import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
// @mui 
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { AuthGuard } from './gaurd/auth-gaurd';

import { SettingsProvider, SettingsDrawer } from './components/settings';

// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
// layouts
import DashboardLayout from './layouts/dashboard';
import LoginPage from './pages/auth/LoginPage';

import Account from './pages/account/account';
import { KanbanView } from './pages/kanban/view'//
// import { OrderListView } from './pages/order/view'

function App() {
  return (
    <HelmetProvider>
        <Router>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SettingsProvider
          defaultSettings={{
            themeMode: 'light', // 'light' | 'dark'
            themeDirection: 'ltr', //  'rtl' | 'ltr'
            themeContrast: 'default', // 'default' | 'bold'
            themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
            themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
            themeStretch: false,
          }}
        >
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
                  {/* <Route 
                    path="/jobs" 
                    element={
                      <AuthGuard>
                        <DashboardLayout><OrderListView /> </DashboardLayout>
                      </AuthGuard>
                    } 
                  /> */}
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
          </SettingsProvider>
      </LocalizationProvider>
        </Router>
    </HelmetProvider>
  );
}

export default App;
