import { useState } from 'react'
import { Route, Routes } from 'react-router'
import ScanQR from './phone_scan/ScanQR'
import RequestPage from './phone_scan/RequestPage'
import ReceiptPage from './phone_scan/ReceiptPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/scanner' element={<ScanQR />}/>
        <Route path='/request' element={<RequestPage />}/>
        <Route path="/receipt" element={<ReceiptPage />} />
      </Routes>
    </>
  )
}

export default App