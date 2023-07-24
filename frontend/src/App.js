import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { ApiProvider } from './contexts/api';
import { AuthGuard } from './gaurd/auth-gaurd';

// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
// layouts
import DashboardLayout from './layouts/dashboard';
import LoginPage from './pages/auth/LoginPage';

import AllStoresDashboard from './pages/dashboards/store/AllStores';
import ProductDashboard from './pages/dashboards/product/Product';

import ProductGrid from './pages/datagrid/products';
import StoreGrid from './pages/datagrid/stores';

import Account from './pages/account/account';

function App() {
  return (
    <HelmetProvider>
        <Router>
          <ThemeProvider>
            <ScrollToTop />
            <AuthProvider>
              <ApiProvider>
                <Routes>
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route 
                    path="/" 
                    element={
                      <AuthGuard>
                        <DashboardLayout><AllStoresDashboard /> </DashboardLayout>
                      </AuthGuard>
                    } 
                  />
                  <Route
                    path="/products/*"
                    element={
                      <AuthGuard>
                        <DashboardLayout>
                          <Routes>
                            <Route path="/" element={<ProductGrid />} />
                            <Route path=":productId" element={<ProductDashboard />} />
                          </Routes>
                        </DashboardLayout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/stores/*"
                    element={
                      <AuthGuard>
                        <DashboardLayout>
                          <Routes>
                            <Route path="/" element={<StoreGrid />} />
                            <Route path=":storeId" element={<AllStoresDashboard />} />
                          </Routes>
                        </DashboardLayout>
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
              </ApiProvider>
            </AuthProvider>
          </ThemeProvider>
        </Router>
    </HelmetProvider>
  );
}

export default App;
