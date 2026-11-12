# SPLITLAB — Micro-frontends vs Monolith

Research demo for the master's thesis: **the same marketplace feature code**, two integration strategies (Module Federation vs monolith), plus an interactive defense lab with **live** experiments.

## Quick start

```bash
npm install
npm start
```

| URL | What |
| --- | --- |
| http://localhost:5100 | СПЛІТЛАБ defense / demo site |
| http://localhost:5200 | Micro-frontend storefront (shell) |
| http://localhost:5201–5203 | Remotes: catalog / checkout / reviews |
| http://localhost:5300 | Monolith storefront (preview of built bundle) |
| http://localhost:5111 | lab-control API (stop/start/release/report) |

```bash
npm run measure      # build time / gzip + metrics-history.json
npm run lab-control  # API only (already included in npm start)
npm run slides       # seminar deck → :5110
```

## Live experiments (defense UI)

1. **Arena** — inject `?fail=` crashes; **Stop/Start** remotes for real network failure  
2. **Metrics** — measured Vite builds + history chart  
3. **Runtime** — browser Performance Timing / transferSize from iframes + bundle map  
4. **Deploy** — simulated pipeline **and** real independent release (bump `version.json`, rebuild only that remote)  
5. **Testing** — auto-checks for ports / lab-control / metrics / stop-start  
6. **Report** — export JSON (+ MD) experiment snapshot  

## Layout

```
mf/shell, mf/catalog, mf/checkout, mf/reviews  # federated apps
monolith/                                      # same features, one bundle
shared/                                        # HostApp, bus, runtimeProbe, products
defense/                                       # demo site (:5100)
scripts/measure.mjs                            # build/size benchmarks + history
scripts/lab-control.mjs                        # remotes lifecycle + release API
```

## Stack

Vite 6 · Module Federation (`@originjs/vite-plugin-federation`) · React 19 · Vue 3 (reviews) · TypeScript · npm workspaces
