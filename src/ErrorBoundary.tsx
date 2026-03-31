import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            应用出现错误
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.toString()}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            重新加载页面
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary