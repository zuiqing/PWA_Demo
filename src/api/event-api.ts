import type { AlarmEventRecord, EventListResponse, EventQuery, EventStats } from '../types/event'

const API_BASE = '/api/events'

function buildQuery(query: EventQuery): string {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const text = params.toString()
  return text ? `?${text}` : ''
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function fetchEvents(query: EventQuery = {}): Promise<EventListResponse> {
  return requestJson<EventListResponse>(`${API_BASE}${buildQuery(query)}`)
}

export function fetchEventStats(): Promise<EventStats> {
  return requestJson<EventStats>(`${API_BASE}/stats`)
}

export function fetchEventDetail(id: string): Promise<AlarmEventRecord> {
  return requestJson<AlarmEventRecord>(`${API_BASE}/${id}`)
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`)
  }
}
