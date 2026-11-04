import { useEffect, useState } from 'react'

export interface BuildResult { name: string; arch: 'mf' | 'monolith'; buildMs: number; jsBytes: number; gzipBytes: number; files: number }
export interface Metrics { measuredAt: string | null; results: BuildResult[]; sample?: boolean }

/** Shown only until `npm run measure` produces real data (clearly labelled in the UI). */
const SAMPLE: Metrics = {
  measuredAt: null,
  sample: true,
  results: [
    { name: 'monolith', arch: 'monolith', buildMs: 2400, jsBytes: 300_000, gzipBytes: 95_000, files: 1 },
    { name: 'shell', arch: 'mf', buildMs: 1500, jsBytes: 215_000, gzipBytes: 68_000, files: 6 },
    { name: 'catalog', arch: 'mf', buildMs: 1100, jsBytes: 18_000, gzipBytes: 6_000, files: 4 },
    { name: 'checkout', arch: 'mf', buildMs: 1100, jsBytes: 20_000, gzipBytes: 6_500, files: 4 },
    { name: 'reviews', arch: 'mf', buildMs: 1200, jsBytes: 95_000, gzipBytes: 36_000, files: 3 },
  ],
}

export function useMetrics() {
  const [m, setM] = useState<Metrics>(SAMPLE)
  useEffect(() => {
    fetch('/metrics.json').then((r) => (r.ok ? r.json() : Promise.reject())).then(setM).catch(() => {})
  }, [])
  return m
}

export const kb = (b: number) => (b / 1024).toFixed(1) + ' KB'
export const sec = (ms: number) => (ms / 1000).toFixed(2) + ' s'
