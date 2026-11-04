export const hostCss = `
*{box-sizing:border-box}
body{margin:0;background:#070b16;font-family:'Inter',system-ui,sans-serif;color:#e2e8f0}
.h-app{min-height:100vh;display:flex;flex-direction:column;background:radial-gradient(1200px 600px at 10% -10%,rgba(99,102,241,.18),transparent),radial-gradient(900px 500px at 110% 10%,rgba(236,72,153,.12),transparent),#070b16}
.h-monolith{background:radial-gradient(1200px 600px at 10% -10%,rgba(245,158,11,.14),transparent),#0a0a10}
.h-header{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:18px;padding:14px 24px;background:rgba(7,11,22,.75);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.06)}
.h-logo{display:flex;align-items:center;gap:8px;font-weight:800;font-size:18px;cursor:pointer;white-space:nowrap}
.h-logo-mark{color:#818cf8;font-size:22px}
.h-arch{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 8px;border-radius:6px}
.h-arch.mf{background:rgba(129,140,248,.15);color:#a5b4fc}.h-arch.monolith{background:rgba(245,158,11,.15);color:#fbbf24}
.h-search{flex:1;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:0 12px;max-width:520px}
.h-search input{flex:1;background:none;border:none;color:#fff;padding:10px 0;font:inherit;outline:none}
.h-nav{display:flex;gap:8px;margin-left:auto}
.h-nav button{position:relative;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#e2e8f0;padding:9px 14px;border-radius:12px;cursor:pointer;font:inherit;font-size:14px;white-space:nowrap;transition:.2s}
.h-nav button:hover,.h-nav button.on{border-color:#818cf8}
.h-nav i{position:absolute;top:-6px;right:-6px;background:#f43f5e;color:#fff;font-style:normal;font-size:11px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:grid;place-items:center;padding:0 4px}
.h-cart.bump{animation:h-bump .4s}
@keyframes h-bump{50%{transform:scale(1.12)}}
.h-main{flex:1;padding:22px 24px;max-width:1400px;width:100%;margin:0 auto}
.h-hero{display:flex;justify-content:space-between;align-items:center;padding:24px 28px;border-radius:22px;margin-bottom:20px;background:linear-gradient(120deg,rgba(99,102,241,.25),rgba(236,72,153,.18));border:1px solid rgba(255,255,255,.08)}
.h-monolith .h-hero{background:linear-gradient(120deg,rgba(245,158,11,.22),rgba(239,68,68,.12))}
.h-hero h1{margin:0 0 6px;font-size:28px}.h-hero p{margin:0;color:#cbd5e1}
.h-hero-emoji{font-size:56px}
.h-grid{display:grid;grid-template-columns:1fr 300px;gap:18px;align-items:start}
@media(max-width:900px){.h-grid{grid-template-columns:1fr}.h-search{display:none}}
.h-slot{position:relative}
.h-slot-mf{outline:1px dashed rgba(129,140,248,.25);outline-offset:6px;border-radius:14px}
.h-slot-tag{position:absolute;top:-16px;right:4px;font-size:10px;font-family:monospace;color:#818cf8;background:#070b16;padding:0 6px;z-index:2}
.h-skeleton{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.h-skeleton div{height:220px;border-radius:18px;background:linear-gradient(90deg,#111827 25%,#1f2937 50%,#111827 75%);background-size:200% 100%;animation:h-sh 1.2s infinite}
@keyframes h-sh{to{background-position:-200% 0}}
.h-fallback{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:36px 20px;border-radius:18px;border:1px dashed rgba(244,63,94,.5);background:repeating-linear-gradient(45deg,rgba(244,63,94,.05) 0 12px,transparent 12px 24px)}
.h-fallback-ico{font-size:34px}.h-fallback span{color:#fda4af;font-family:monospace;font-size:12px}.h-fallback small{color:#94a3b8}
.h-fallback button{margin-top:6px;background:#f43f5e;border:none;color:#fff;padding:8px 16px;border-radius:10px;cursor:pointer;font:inherit}
.h-fatal{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;background:#0a0a0a;color:#e5e5e5}
.h-fatal-code{font-size:110px;font-weight:900;background:linear-gradient(#ef4444,#7f1d1d);-webkit-background-clip:text;color:transparent;line-height:1}
.h-fatal pre{background:#1a0606;color:#fca5a5;border:1px solid #7f1d1d;padding:14px 18px;border-radius:10px;text-align:left;max-width:90%;overflow:auto}
.h-fatal p{color:#a3a3a3;max-width:520px}
.h-orders h2{margin-top:0}
.h-order{display:grid;grid-template-columns:1.4fr 1fr auto auto;gap:14px;align-items:center;padding:14px 18px;margin-bottom:10px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.h-order-items{display:flex;gap:8px;flex-wrap:wrap}
.h-order button{background:rgba(129,140,248,.15);border:1px solid rgba(129,140,248,.4);color:#c7d2fe;border-radius:10px;padding:7px 12px;cursor:pointer;font:inherit}
.h-muted{color:#64748b}
.h-footer{display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center;padding:12px 24px;border-top:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.3);font-size:12px}
.h-footer-title{font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;font-size:10px}
.h-mod{display:flex;align-items:center;gap:6px;color:#94a3b8}.h-mod b{color:#e2e8f0}
.h-dot{width:8px;height:8px;border-radius:50%;background:#475569}.h-dot.ok{background:#22c55e;box-shadow:0 0 8px #22c55e}
.h-bus{margin-left:auto;color:#94a3b8}.h-bus summary{cursor:pointer}
.h-bus div{display:flex;flex-direction:column;gap:2px;max-height:140px;overflow:auto;margin-top:6px}
.h-bus code{font-size:11px}.h-bus code b{color:#a5b4fc}
.h-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:.3s;z-index:30}
.h-overlay.on{opacity:1;pointer-events:auto}
.h-drawer{position:fixed;top:0;right:0;bottom:0;width:min(380px,92vw);background:#0d1324;border-left:1px solid rgba(255,255,255,.08);z-index:31;padding:20px;display:flex;flex-direction:column;gap:12px;transform:translateX(100%);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.h-drawer.on{transform:none}
.h-drawer-head{display:flex;justify-content:space-between;align-items:center}.h-drawer-head h3{margin:0}
.h-drawer-head button{background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer}
.h-line{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,.04)}
.h-line-emoji{font-size:28px}.h-line-info{flex:1;display:flex;flex-direction:column;font-size:13px}.h-line-info span{color:#94a3b8}
.h-qty{display:flex;align-items:center;gap:8px}
.h-qty button{width:26px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:none;color:#fff;cursor:pointer}
.h-drawer-total{margin-top:auto;display:flex;justify-content:space-between;font-size:18px;padding-top:12px;border-top:1px dashed rgba(255,255,255,.15)}
.h-primary{background:linear-gradient(135deg,#6366f1,#ec4899);border:none;color:#fff;padding:14px;border-radius:12px;font:inherit;font-weight:700;cursor:pointer}
.h-primary:disabled{opacity:.4}
.h-toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#111827;border:1px solid rgba(255,255,255,.1);padding:12px 18px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:h-up .3s;z-index:40;font-size:14px}
@keyframes h-up{from{opacity:0;transform:translate(-50%,10px)}}
`
