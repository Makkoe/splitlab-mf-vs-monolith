/**
 * Framework-agnostic event bus (contract between micro-frontends).
 * Uses browser-native CustomEvent, so React, Vue or vanilla JS remotes can all participate
 * without sharing any library. Events are mirrored to window.parent (the Lab) via postMessage.
 */
export interface BusEvent<T = unknown> {
  type: string
  detail: T
  source: string
  ts: number
}

const CHANNEL = 'mf-bus'

export function emit<T>(type: string, detail: T, source: string) {
  const ev: BusEvent<T> = { type, detail, source, ts: Date.now() }
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: ev }))
  try {
    if (window.parent !== window) window.parent.postMessage({ __mfbus: true, ...ev }, '*')
  } catch {
    /* cross-origin parent — ignore */
  }
}

export function on<T = unknown>(type: string | '*', cb: (ev: BusEvent<T>) => void) {
  const handler = (e: Event) => {
    const ev = (e as CustomEvent<BusEvent<T>>).detail
    if (type === '*' || ev.type === type) cb(ev)
  }
  window.addEventListener(CHANNEL, handler)
  return () => window.removeEventListener(CHANNEL, handler)
}

/** Reads ?fail=catalog,checkout — used by the Lab to inject failures. */
export function failedModules(): string[] {
  return (new URLSearchParams(location.search).get('fail') ?? '').split(',').filter(Boolean)
}
