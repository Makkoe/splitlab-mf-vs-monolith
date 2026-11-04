export const css = `
.rv-root{background:linear-gradient(170deg,rgba(6,78,59,.35),rgba(15,23,42,.9));border:1px solid rgba(52,211,153,.2);border-radius:18px;padding:18px;color:#e2e8f0;display:flex;flex-direction:column;gap:12px}
.rv-head{display:flex;flex-direction:column;gap:6px}
.rv-head h3{margin:0;font-size:16px}
.rv-vue{align-self:flex-start;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#34d399;background:rgba(52,211,153,.12);padding:3px 8px;border-radius:6px}
.rv-avg b{font-size:26px;color:#34d399}.rv-avg span{color:#94a3b8;font-size:13px}
.rv-tip{color:#94a3b8;font-size:12px;margin:0;line-height:1.5}
.rv-list{display:flex;flex-direction:column;gap:8px;max-height:330px;overflow:auto}
.rv-item{background:rgba(255,255,255,.04);border-radius:12px;padding:10px 12px;animation:rv-in .35s ease}
.rv-item p{margin:4px 0 0;font-size:13px;color:#cbd5e1}
.rv-meta{display:flex;justify-content:space-between;font-size:13px}
.rv-stars{color:#fbbf24;letter-spacing:1px}
.rv-form{display:flex;flex-direction:column;gap:8px}
.rv-pick{display:flex;gap:2px}
.rv-star{background:none;border:none;font-size:20px;color:#334155;cursor:pointer;transition:.15s}
.rv-star.on{color:#fbbf24}.rv-star:hover{transform:scale(1.2)}
.rv-form textarea{background:#0b1220;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;color:#fff;font:inherit;font-size:13px;resize:none}
.rv-form textarea:focus{outline:none;border-color:#34d399}
.rv-btn{background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;padding:10px;border-radius:10px;font:inherit;font-weight:600;cursor:pointer}
.rv-btn:hover{filter:brightness(1.1)}
@keyframes rv-in{from{opacity:0;transform:translateY(6px)}to{opacity:1}}
`
