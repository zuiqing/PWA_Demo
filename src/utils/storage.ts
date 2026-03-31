import type { DeviceInfo } from '../types/device'

const STORAGE_KEY = 'qv_monitor_devices'

function encode(text: string): string {
  return btoa(encodeURIComponent(text))
}

function decode(encoded: string): string {
  return decodeURIComponent(atob(encoded))
}

export function saveDevices(devices: DeviceInfo[]): void {
  const json = JSON.stringify(devices)
  localStorage.setItem(STORAGE_KEY, encode(json))
}

export function loadDevices(): DeviceInfo[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return JSON.parse(decode(raw))
}

export function removeDevices(): void {
  localStorage.removeItem(STORAGE_KEY)
}
