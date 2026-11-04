import { useState } from 'react'

const QUESTIONS = [
  { id: 'teams', q: 'Скільки команд працює над фронтендом?', lo: '1 команда', hi: '10+ команд', w: 3 },
  { id: 'domains', q: 'Скільки окремих бізнес-доменів?', lo: 'Один', hi: 'Багато', w: 2 },
  { id: 'release', q: 'Потрібна частота релізів', lo: 'Щомісяця', hi: 'Багато на день', w: 2 },
  { id: 'legacy', q: 'Потрібна поступова міграція legacy?', lo: 'Ні', hi: 'Так, критично', w: 2 },
  { id: 'tech', q: 'Потреба в різнорідних стеках', lo: 'Немає', hi: 'Сильна', w: 1 },
  { id: 'perf', q: 'Розмір payload — пріоритет №1', lo: 'Ні', hi: 'Абсолютно', w: -2 },
  { id: 'ops', q: 'Зрілість DevOps (CI/CD, моніторинг)', lo: 'Низька', hi: 'Висока', w: 1.5 },
]

export function Decide() {
  const [v, setV] = useState<Record<string, number>>(Object.fromEntries(QUESTIONS.map((q) => [q.id, 2])))
  const totalW = QUESTIONS.reduce((s, q) => s + Math.abs(q.w), 0)
  const raw = QUESTIONS.reduce((s, q) => s + q.w * (v[q.id] - 2) / 2, 0)
  const score = Math.round((raw / totalW + 1) * 50)
  const verdict =
    score > 62
      ? [
          'Мікрофронтенди',
          'mf',
          'Ваш контекст виграє від незалежних команд і деплоїв. Почніть з вертикального поділу та Module Federation.',
        ]
      : score < 40
        ? [
            'Моноліт (модульний)',
            'mono',
            'Залиште добре структурований модульний моноліт. Поверніться до питання, коли достатньо команд або доменів створять реальний біль.',
          ]
        : [
            'Модульний моноліт → готовий до MF',
            'muted',
            'Структуруйте код за доменами з чіткими межами зараз; виділяйте мікрофронтенди, коли зʼявиться біль.',
          ]

  return (
    <section id="decide" className="section">
      <div className="reveal">
        <div className="eyebrow">09 · Фреймворк рішення</div>
        <h2 className="h2">
          Чи варто <span className="mf">вам</span> використовувати мікрофронтенди?
        </h2>
        <p className="lead">Зважена багатокритеріальна модель з аналізу вище. Підлаштуйте під реальний проєктний контекст.</p>
      </div>
      <div className="grid2 reveal">
        <div className="panel">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="q">
              <div className="q-head">
                {q.q}
                <span>
                  {v[q.id]}/4
                </span>
              </div>
              <input
                className="range"
                type="range"
                min={0}
                max={4}
                value={v[q.id]}
                onChange={(e) => setV({ ...v, [q.id]: +e.target.value })}
              />
              <small>
                <span>{q.lo}</span>
                <span>
                  вага {q.w > 0 ? '+' : ''}
                  {q.w}
                </span>
                <span>{q.hi}</span>
              </small>
            </div>
          ))}
        </div>
        <div className="panel" style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
          <div className="muted" style={{ fontSize: 13 }}>
            Оцінка рекомендації
          </div>
          <div className="big-num">
            {score}
            <span className="muted" style={{ fontSize: 20 }}>
              /100
            </span>
          </div>
          <div className="gauge">
            <div className="gauge-needle" style={{ left: `${score}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }} className="muted">
            <span>Моноліт</span>
            <span>Гібрид</span>
            <span>Мікрофронтенди</span>
          </div>
          <div className={`verdict ${verdict[1]}`}>{verdict[0]}</div>
          <p className="muted" style={{ margin: 0 }}>
            {verdict[2]}
          </p>
        </div>
      </div>
    </section>
  )
}
