import { useEffect, useState } from 'react'
import { labApi } from '../labApi'

type Probe = Record<string, unknown>

export function Report() {
  const [runtime, setRuntime] = useState<{ mf?: Probe; mono?: Probe }>({})
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string>('')

  useEffect(() => {
    const h = (e: MessageEvent) => {
      if (!e.data?.__mfruntime) return
      const mode = e.data.mode === 'mf' ? 'mf' : 'mono'
      setRuntime((r) => ({ ...r, [mode]: e.data }))
    }
    window.addEventListener('message', h)
    return () => window.removeEventListener('message', h)
  }, [])

  const exportReport = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const report = await labApi.report({
        runtime,
        arenaNote: 'Exported from SPLITLAB defense UI',
        exportedAt: new Date().toISOString(),
      })
      const text = JSON.stringify(report, null, 2)
      setPreview(text.slice(0, 2500) + (text.length > 2500 ? '\n…' : ''))
      const blob = new Blob([text], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `splitlab-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
      a.click()
      URL.revokeObjectURL(a.href)

      // also try markdown from public file after server write
      try {
        const md = await fetch('http://localhost:5111/api/report').then(() => fetch('/last-report.md'))
        if (md.ok) {
          const mdText = await md.text()
          const b2 = new Blob([mdText], { type: 'text/markdown' })
          const a2 = document.createElement('a')
          a2.href = URL.createObjectURL(b2)
          a2.download = 'splitlab-report.md'
          a2.click()
          URL.revokeObjectURL(a2.href)
        }
      } catch {
        /* markdown optional */
      }

      setStatus('Звіт збережено на сервері (defense/public/last-report.*) і завантажено у браузер.')
    } catch (e) {
      setStatus('Помилка: ' + String((e as Error).message || e) + ' — потрібен lab-control :5111')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="report" className="section">
      <div className="reveal">
        <div className="eyebrow">09b · Відтворюваність</div>
        <h2 className="h2">
          Експорт <span className="mf">звіту експерименту</span>
        </h2>
        <p className="lead">
          Збирає стан remotes, останні build-метрики, bundle map, runtime-проби з iframe і (якщо був) останній
          незалежний реліз — у JSON/Markdown для додатку до магістерської.
        </p>
      </div>
      <div className="panel reveal">
        <div className="arena-controls" style={{ marginBottom: 0 }}>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={exportReport}>
            {busy ? 'Збираю…' : 'Завантажити звіт JSON (+ MD)'}
          </button>
          <span className="muted" style={{ fontSize: 13 }}>
            runtime mf: {runtime.mf ? '✓' : '—'} · mono: {runtime.mono ? '✓' : '—'}
          </span>
        </div>
        {status && <div className="note" style={{ marginTop: '0.85rem' }}>{status}</div>}
        {preview && (
          <pre style={{ marginTop: '1rem', maxHeight: 280, overflow: 'auto' }}>{preview}</pre>
        )}
      </div>
    </section>
  )
}
