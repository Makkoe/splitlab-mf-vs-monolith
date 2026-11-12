/** Collects browser Performance Timing and posts it to the SPLITLAB parent frame. */
export type RuntimeReport = {
  __mfruntime: true
  mode: 'mf' | 'monolith'
  ts: number
  href: string
  domContentLoadedMs: number | null
  loadEventMs: number | null
  transferBytes: number
  encodedBytes: number
  jsFiles: number
  modules: Record<string, { version: string; framework: string; mountMs: number }>
  chunks: { name: string; transferSize: number; duration: number }[]
}

let timer: ReturnType<typeof setTimeout> | null = null

export function reportRuntime(
  mode: 'mf' | 'monolith',
  modules: Record<string, { version: string; framework: string; mountMs: number }> = {},
) {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const js = resources.filter((r) => /\.js(\?|$)/.test(r.name) || r.name.includes('remoteEntry'))
    const report: RuntimeReport = {
      __mfruntime: true,
      mode,
      ts: Date.now(),
      href: location.href,
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEventMs: nav ? Math.round(nav.loadEventEnd) : null,
      transferBytes: js.reduce((s, r) => s + (r.transferSize || 0), 0),
      encodedBytes: js.reduce((s, r) => s + (r.encodedBodySize || 0), 0),
      jsFiles: js.length,
      modules,
      chunks: js
        .map((r) => ({
          name: decodeURIComponent(r.name.split('/').pop() || r.name),
          transferSize: r.transferSize || 0,
          duration: Math.round(r.duration),
        }))
        .sort((a, b) => b.transferSize - a.transferSize)
        .slice(0, 16),
    }
    try {
      if (window.parent !== window) window.parent.postMessage(report, '*')
      ;(window as unknown as { __SPLITLAB_RUNTIME__?: RuntimeReport }).__SPLITLAB_RUNTIME__ = report
    } catch {
      /* ignore */
    }
  }, 700)
}
