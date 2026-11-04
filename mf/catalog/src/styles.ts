export const css = `
.cat-root{display:flex;flex-direction:column;gap:16px}
.cat-toolbar{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}
.cat-chips{display:flex;gap:8px;flex-wrap:wrap}
.cat-chip{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#cbd5e1;padding:8px 14px;border-radius:999px;cursor:pointer;font:inherit;font-size:13px;transition:.2s}
.cat-chip:hover{border-color:#60a5fa;color:#fff}
.cat-chip.on{background:linear-gradient(135deg,#3b82f6,#6366f1);border-color:transparent;color:#fff;box-shadow:0 4px 18px rgba(99,102,241,.4)}
.cat-sort{background:#0f172a;color:#e2e8f0;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:8px 12px;font:inherit;font-size:13px}
.cat-hint{color:#94a3b8;font-size:13px;margin:0}
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.cat-card{position:relative;background:linear-gradient(160deg,rgba(30,41,59,.9),rgba(15,23,42,.9));border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:16px;cursor:pointer;transition:transform .25s,border-color .25s,box-shadow .25s}
.cat-card:hover{transform:translateY(-4px);border-color:rgba(96,165,250,.5);box-shadow:0 12px 30px rgba(0,0,0,.35)}
.cat-badge{position:absolute;top:12px;left:12px;background:#f43f5e;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px}
.cat-heart{position:absolute;top:10px;right:10px;background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;transition:transform .2s}
.cat-heart:hover{transform:scale(1.2)}.cat-heart.on{color:#f43f5e}
.cat-emoji{font-size:54px;text-align:center;margin:14px 0 10px;filter:drop-shadow(0 6px 12px rgba(0,0,0,.4))}
.cat-brand{color:#60a5fa;font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.cat-name{color:#f1f5f9;font-size:15px;margin:4px 0 6px;font-weight:600}
.cat-rating{color:#fbbf24;font-size:12px}
.cat-bottom{display:flex;justify-content:space-between;align-items:flex-end;margin-top:12px}
.cat-price{color:#fff;font-weight:700;font-size:17px}
.cat-old{color:#64748b;font-size:12px;text-decoration:line-through}
.cat-add{background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#fff;border-radius:10px;padding:8px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:.2s}
.cat-add:hover{filter:brightness(1.15);transform:scale(1.05)}
.cat-add.done{background:#0ea5e9}
.cat-empty{grid-column:1/-1;text-align:center;color:#64748b;padding:40px}
`
