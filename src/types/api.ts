export interface CloudApiResponse {
  code: number
  timestamp: number
  path: string
  msg: string
  data: { remote_addr: string } | null
  errTip: string
}

export interface DeviceCgiResponse {
  error: number
  content?: Record<string, unknown>
}

export interface DeviceCgiJsonBody {
  header: {
    security: string
    username: string
    password: string
    passwordencode?: string | number
  }
  body: {
    command: string
    content?: Record<string, unknown>
  }
}
