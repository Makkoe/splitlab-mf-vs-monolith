/** Client for scripts/lab-control.mjs (:5111). Falls back gracefully if offline. */
const BASE = 'http://localhost:5111'

export type RemoteStatus = {
  port: number
  up: boolean
  version: string
  releasedAt: string
  remoteEntry: { path: string; bytes: number; mtime: string; sha256: string } | null
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }))
    throw new Error((err as { error?: string }).error || r.statusText)
  }
  return r.json() as Promise<T>
}

export function useLabHealth(pollMs = 4000) {
  // imported by components that manage their own state — keep helpers pure
  return { BASE, pollMs }
}

export const labApi = {
  health: () => req<{ ok: boolean; remotes: Record<string, RemoteStatus> }>('/api/health'),
  remotes: () => req<Record<string, RemoteStatus>>('/api/remotes'),
  stop: (name: string) => req<{ name: string; up: boolean; remotes: Record<string, RemoteStatus> }>(`/api/remotes/${name}/stop`, { method: 'POST' }),
  start: (name: string) => req<{ name: string; up: boolean; remotes: Record<string, RemoteStatus> }>(`/api/remotes/${name}/start`, { method: 'POST' }),
  release: (name: string) =>
    req<{
      name: string
      previousVersion: string
      nextVersion: string
      buildMs: number
      shellRebuilt: boolean
      monolithRebuilt: boolean
      remoteEntryBefore: RemoteStatus['remoteEntry']
      remoteEntryAfter: RemoteStatus['remoteEntry']
      up: boolean
      note: string
    }>(`/api/remotes/${name}/release`, { method: 'POST' }),
  history: () => req<{ history: { measuredAt: string; results: { name: string; buildMs: number; gzipBytes: number }[] }[] }>('/api/metrics/history'),
  bundleMap: () => req<{ units: { name: string; arch: string; totalBytes: number; files: { name: string; bytes: number }[] }[] }>('/api/bundle-map'),
  report: (body?: unknown) =>
    req<Record<string, unknown>>('/api/report', body ? { method: 'POST', body: JSON.stringify(body) } : undefined),
}

export function kb(n: number) {
  return (n / 1024).toFixed(1) + ' KB'
}
