import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import RequireAuth from './components/layout/RequireAuth.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import JobsBoardPage from './pages/JobsBoardPage.jsx'
import JobDetailPage from './pages/JobDetailPage.jsx'
import RaiseJobPage from './pages/RaiseJobPage.jsx'
import BuildingsPage from './pages/BuildingsPage.jsx'
import BuildingDetailPage from './pages/BuildingDetailPage.jsx'
import InspectionsPage from './pages/InspectionsPage.jsx'
import InspectionDetailPage from './pages/InspectionDetailPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/jobs" replace />} />
        <Route path="jobs" element={<JobsBoardPage />} />
        <Route path="jobs/new" element={<RaiseJobPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="buildings" element={<BuildingsPage />} />
        <Route path="buildings/:id" element={<BuildingDetailPage />} />
        <Route path="inspections" element={<InspectionsPage />} />
        <Route path="inspections/:id" element={<InspectionDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
