import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { DeviceProvider } from './context/DeviceContext'
import theme from './theme'
import DeviceListPage from './pages/DeviceListPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import DeviceConfigPage from './pages/DeviceConfigPage'
import SettingsPage from './pages/SettingsPage'
import ErrorBoundary from './ErrorBoundary'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/monitor">
        <DeviceProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<DeviceListPage />} />
              <Route path="/device/:id" element={<DeviceDetailPage />} />
              <Route path="/device/:id/config" element={<DeviceConfigPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </ErrorBoundary>
        </DeviceProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
