# SPLITLAB — Micro-frontends vs Monolith

Research demo platform: **the same marketplace feature code**, two integration strategies (Module Federation remotes vs a single SPA bundle), plus an interactive lab for comparison.

## Quick start

```bash
npm install
npm start
```

| URL | What |
| --- | --- |
| http://localhost:5100 | SPLITLAB defense / demo site |
| http://localhost:5200 | Micro-frontend storefront (shell) |
| http://localhost:5201–5203 | Remotes: catalog / checkout / reviews |
| http://localhost:5300 | Monolith storefront |

```bash
npm run measure   # rebuild metrics (build time / gzip) for the Metrics section
npm run slides    # seminar web deck → http://localhost:5110
```

Windows: `START_PLATFORM.bat` or `MEASURE_BENCHMARKS.bat`.

## Layout

```
mf/shell, mf/catalog, mf/checkout, mf/reviews  # federated apps
monolith/                                      # same features, one bundle
shared/                                        # shared feature code
defense/                                       # demo site (:5100)
lab/                                           # alternate lab UI
presentation/                                  # seminar slides
scripts/measure.mjs                            # build/size benchmarks
```

## Stack

Vite 6 · Module Federation (`@originjs/vite-plugin-federation`) · React 19 · Vue 3 (reviews) · TypeScript · npm workspaces
