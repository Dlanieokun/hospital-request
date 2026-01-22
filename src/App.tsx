import { Route, Routes, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './components/RouteGuards'
import Layouts from './web/Layout'
import Login from './web/auth/Login'
import Register from './web/auth/Register'
import SettingsSetup from './web/Settings'
import Treasurer from './web/Treasurer'
import Overview from './web/auth/Overview'
import ScanQR from './phone_scan/ScanQR'
import RequestPage from './phone_scan/RequestPage'
import ReceiptPage from './phone_scan/ReceiptPage'
import CertificateRequest from './web/CertificateRequest'

function App() {
  return (
    <Routes>
      {/* AUTH ROUTES: Only accessible if logged out */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/scanner" element={<ScanQR />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/receipt" element={<ReceiptPage />} />
      </Route>

      {/* SECURE ROUTES: Only accessible if logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/hospital" element={<Layouts />}>
          <Route index element={<Overview />} />
          <Route path="treasurer" element={<Treasurer />} />
          <Route path="certificate" element={<CertificateRequest />} />
          <Route path="settings" element={<SettingsSetup />} />
        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/hospital" replace />} />
    </Routes>
  )
}

export default App