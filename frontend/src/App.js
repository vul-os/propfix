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
import SignUpPage from './pages/auth/signup-page'; // Update the path accordingly
import ForgotPasswordPage from './pages/auth/forgot-password-page'; // Update the path accordingly

// layouts
import DashboardLayout from './layouts/dashboard';
import LoginPage from './pages/auth/LoginPage';

import Account from './pages/account/account';
import { KanbanView } from './pages/kanban/view';
import JobDataGrid from './pages/data-grid/data-grid';

// Import the Stepper component
import Stepper from './pages/job-wizzard/stepper'; // Make sure this path is correct

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
                  <Route path="/auth/signup" element={<SignUpPage />} /> {/* New route */}
                  <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} /> {/* New route */}
                  <Route 
                    path="/" 
                    element={
                      <AuthGuard>
                        <DashboardLayout><KanbanView /> </DashboardLayout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <AuthGuard>
                        <DashboardLayout><JobDataGrid /> </DashboardLayout>
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
                  <Route
                    path="/job-wizzard/*"
                    element={
                      <AuthGuard>
                        <DashboardLayout>
                          <Routes>
                            {/* Add the route for the Stepper component */}
                            <Route path="/" element={<Stepper />} />
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
