import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1',
      light: '#42A5F5',
      dark: '#002171',
    },
    secondary: {
      main: '#1565C0',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    success: { main: '#4CAF50' },
    error: { main: '#F44336' },
    warning: { main: '#FF9800' },
    info: { main: '#2196F3' },
  },
  typography: {
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h5: { fontWeight: 600, fontSize: '22px' },
    h6: { fontWeight: 600, fontSize: '18px' },
    subtitle1: { fontWeight: 500, fontSize: '16px' },
    body1: { fontSize: '14px' },
    body2: { fontSize: '12px' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 'auto',
          padding: '6px 0',
        },
      },
    },
  },
})

export default theme
