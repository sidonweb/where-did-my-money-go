import { authTokenKey } from '../data/constants'
import type { AppState, SettingsState, Transaction, User } from '../types'

export type AuthInput = { email: string; name?: string; password: string; mode: 'login' | 'signup' }

export async function fetchSession(token: string) {
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Please sign in again')
  return readJson<{ user: User; state: AppState }>(response)
}

export async function authenticate(input: AuthInput) {
  const response = await fetch(`/api/auth/${input.mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      password: input.password,
    }),
  })
  if (!response.ok) {
    const payload = await readJson<{ error?: string }>(response)
    throw new Error(payload?.error ?? 'Authentication failed')
  }
  return readJson<{ token: string; user: User; state: AppState }>(response)
}

export async function logout() {
  const token = localStorage.getItem(authTokenKey)
  if (!token) return
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateProfile(input: { name: string }) {
  return request<User>('/api/profile', { method: 'PUT', body: JSON.stringify(input) })
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  await request<{ success: true }>('/api/profile/password', { method: 'PUT', body: JSON.stringify(input) })
}

export async function saveSettings(settings: SettingsState) {
  return requestState('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

export async function saveTransaction(transaction: Transaction) {
  return requestState(`/api/transactions${transaction.id ? `/${transaction.id}` : ''}`, {
    method: transaction.id ? 'PUT' : 'POST',
    body: JSON.stringify(transaction),
  })
}

export async function removeTransaction(id: string) {
  return requestState(`/api/transactions/${id}`, { method: 'DELETE' })
}

export async function importState(state: AppState) {
  return requestState('/api/import', {
    method: 'POST',
    body: JSON.stringify(state),
  })
}

export async function resetState() {
  return requestState('/api/reset', { method: 'POST' })
}

async function requestState(path: string, init: RequestInit = {}) {
  return request<AppState>(path, init)
}

async function request<T>(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem(authTokenKey)
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!response.ok) {
    const payload = await readJson<{ error?: string }>(response)
    throw new Error(payload?.error ?? `Request failed with ${response.status}`)
  }
  return readJson<T>(response)
}

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('The API returned HTML instead of JSON. Start the full application with `npm run dev`.')
  }
  return (await response.json()) as T
}
