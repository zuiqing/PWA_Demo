import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { DeviceProvider } from './context/DeviceContext'
import { LanguageProvider } from './context/LanguageContext'
import theme from './theme'
import DeviceListPage from './pages/DeviceListPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import DeviceConfigPage from './pages/DeviceConfigPage'
import SettingsPage from './pages/SettingsPage'
import CgiDebugPage from './pages/CgiDebugPage'
import DocViewerPage from './pages/DocViewerPage'
import AlarmListPage from './pages/AlarmListPage'
import ErrorBoundary from './ErrorBoundary'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/monitor">
        <DeviceProvider>
          <LanguageProvider>
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<DeviceListPage />} />
              <Route path="/device/:id" element={<DeviceDetailPage />} />
              <Route path="/device/:id/config" element={<DeviceConfigPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/alarms" element={<AlarmListPage />} />
              <Route path="/debug" element={<CgiDebugPage />} />
              <Route path="/doc" element={<DocViewerPage />} />
            </Routes>
            </ErrorBoundary>
          </LanguageProvider>
        </DeviceProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
