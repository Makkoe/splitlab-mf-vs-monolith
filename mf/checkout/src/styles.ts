export const css = `
.co-root{color:#e2e8f0}
.co-steps{display:flex;gap:10px;margin-bottom:18px}
.co-step{flex:1;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,.04);color:#64748b;font-size:13px;border:1px solid rgba(255,255,255,.06);transition:.3s}
.co-step b{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#1e293b;font-size:12px}
.co-step.on{color:#fff;border-color:rgba(236,72,153,.5);background:rgba(236,72,153,.08)}
.co-step.on b{background:linear-gradient(135deg,#ec4899,#8b5cf6)}
.co-layout{display:grid;grid-template-columns:1.4fr 1fr;gap:18px}
@media(max-width:800px){.co-layout{grid-template-columns:1fr}}
.co-panel,.co-summary{background:rgba(15,23,42,.8);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:12px}
.co-panel h3,.co-summary h3{margin:0 0 4px;font-size:16px}
.co-field{display:flex;flex-direction:column;gap:5px;font-size:12px;color:#94a3b8}
.co-field input{background:#0b1220;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 12px;color:#fff;font:inherit;font-size:14px;transition:.2s}
.co-field input:focus{outline:none;border-color:#ec4899;box-shadow:0 0 0 3px rgba(236,72,153,.2)}
.co-field input.err{border-color:#f43f5e}
.co-field small{color:#fb7185}
.co-opt{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.08);cursor:pointer;transition:.2s}
.co-opt.on{border-color:#ec4899;background:rgba(236,72,153,.08)}
.co-opt input{accent-color:#ec4899}
.co-opt-l{flex:1;display:flex;flex-direction:column}.co-opt-l small{color:#64748b}
.co-row{display:flex;gap:10px}
.co-btn{background:linear-gradient(135deg,#ec4899,#8b5cf6);border:none;color:#fff;padding:12px 18px;border-radius:12px;font:inherit;font-weight:600;cursor:pointer;transition:.2s;flex:1}
.co-btn:hover{filter:brightness(1.12)}.co-btn:disabled{opacity:.6}
.co-btn.ghost{background:rgba(255,255,255,.06);flex:0 0 auto}
.co-btn.pay{background:linear-gradient(135deg,#22c55e,#0ea5e9)}
.co-line{display:flex;justify-content:space-between;font-size:13px;gap:10px}
.co-line.muted{color:#94a3b8}
.co-total{display:flex;justify-content:space-between;border-top:1px dashed rgba(255,255,255,.15);padding-top:12px;font-size:17px}
.co-success{text-align:center;padding:50px 20px;display:flex;flex-direction:column;align-items:center;gap:12px}
.co-success p{color:#94a3b8;max-width:440px}
.co-success code{color:#f472b6}
.co-success .co-btn{flex:0 0 auto}
.co-check{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;font-size:34px;background:linear-gradient(135deg,#22c55e,#0ea5e9);animation:co-pop .5s cubic-bezier(.2,1.6,.4,1)}
@keyframes co-pop{from{transform:scale(0)}to{transform:scale(1)}}
`
