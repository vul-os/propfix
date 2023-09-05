import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
// @mui 
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { AuthGuard } from './gaurd/auth-gaurd';
import { BoardProvider } from './contexts/board'; // Import BoardProvider

import { SettingsProvider, SettingsDrawer } from './components/settings';

// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import SignUpPage from './pages/auth/signup-page'; // Update the path accordingly
import ForgotPasswordPage from './pages/auth/forgot-password-page'; // Update the path accordingly
import LabelsPage from './pages/labels/labels'; // Replace with the actual path


// layouts
import DashboardLayout from './layouts/dashboard';
import LoginPage from './pages/auth/LoginPage';

import Account from './pages/account/account';
import { KanbanView } from './pages/kanban/view';
import JobDataGrid from './pages/jobs/data-grid/data-grid';
import EventsList from './pages/jobs/events/events-list';

// Import the Stepper component
import Stepper from './pages/job-wizzard/stepper'; // Make sure this path is correct

function App() {
  return (
    <HelmetProvider>
      <Router>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SettingsProvider
            defaultSettings={{
              themeMode: 'light',
              themeDirection: 'ltr',
              themeContrast: 'default',
              themeLayout: 'vertical',
              themeColorPresets: 'default',
              themeStretch: false,
            }}
          >
            <ThemeProvider>
              <ScrollToTop />
              <AuthProvider>
                <Routes>
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/signup" element={<SignUpPage />} />
                  <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                  <Route
                    path="/"
                    element={
                      <AuthGuard>
                        <BoardProvider>
                          <DashboardLayout><KanbanView /></DashboardLayout>
                        </BoardProvider>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <AuthGuard>
                        <BoardProvider>
                          <DashboardLayout><JobDataGrid /></DashboardLayout>
                        </BoardProvider>
                      </AuthGuard>
                    }
                  />
                   <Route
                    path="/labels"
                    element={
                      <AuthGuard>
                        <BoardProvider>
                          <DashboardLayout><LabelsPage /></DashboardLayout>
                        </BoardProvider>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/events/*"
                    element={
                      <AuthGuard>
                        <BoardProvider>
                          <DashboardLayout>
                            <Routes>
                              <Route path=":jobId" element={<EventsList />} />
                            </Routes>
                          </DashboardLayout>
                        </BoardProvider>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/account/*"
                    element={
                      <AuthGuard>
                        <BoardProvider>
                          <DashboardLayout>
                            <Routes>
                              <Route path="/" element={<Account />} />
                              <Route path=":accountVar" element={<Account />} />
                            </Routes>
                          </DashboardLayout>
                        </BoardProvider>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/job-wizzard/*"
                    element={
                      <AuthGuard>
                        <BoardProvider>
                          <DashboardLayout>
                            <Routes>
                              <Route path="/" element={<Stepper />} />
                            </Routes>
                          </DashboardLayout>
                        </BoardProvider>
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
