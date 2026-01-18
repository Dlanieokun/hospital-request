import { useState } from 'react'
import { Route, Routes } from 'react-router-dom' // Ensure you use 'react-router-dom'
import ScanQR from './phone_scan/ScanQR'
import RequestPage from './phone_scan/RequestPage'
import ReceiptPage from './phone_scan/ReceiptPage'
import Layout from './web/layout'
import { Settings } from 'lucide-react'
import SettingsSetup from './web/Settings'
import Treasurer from './web/Treasurer'

function App() {
  return (
    <Routes>
      {/* Standalone Mobile Routes */}
      <Route path='/scanner' element={<ScanQR />}/>
      <Route path='/request' element={<RequestPage />}/>
      <Route path="/receipt" element={<ReceiptPage />} />

      {/* Hospital Dashboard with Nested Routes */}
      <Route path="/hospital" element={<Layout />}>
        {/* These will render inside the <Outlet /> in Layout.tsx */}
        <Route index element={<div>Overview Content</div>} />
        <Route path="treasurer" element={<Treasurer />} />
        <Route path="certificate" element={<div>Certificate Content</div>} />
        <Route path="settings" element={<SettingsSetup />} />
      </Route>
    </Routes>
  )
}

export default App