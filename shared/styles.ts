/**
 * Each remote ships its CSS inside its JS bundle and injects it on first import.
 * Class names are prefixed per team (cat-, co-, rv-) — a simple, zero-dependency CSS isolation strategy.
 */
export function injectStyles(id: string, css: string) {
  if (typeof document === 'undefined' || document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id
  el.textContent = css
  document.head.appendChild(el)
}
