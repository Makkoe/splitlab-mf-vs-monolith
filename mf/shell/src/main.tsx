import { createRoot } from 'react-dom/client'
import { HostApp, type Loaders, type RemoteModule } from '../../../shared/HostApp'

/** Normalize Module Federation ESM unwrap (named exports may land on `.default`). */
async function loadRemote(importer: () => Promise<unknown>): Promise<RemoteModule> {
  const raw = (await importer()) as RemoteModule & { default?: RemoteModule }
  const mod = typeof raw?.mount === 'function' ? raw : raw?.default
  if (!mod || typeof mod.mount !== 'function') throw new Error('Remote module missing mount()')
  return mod
}

// Runtime integration: each remote is fetched from its own server on demand.
const loaders: Loaders = {
  // @ts-expect-error federated module
  catalog: () => loadRemote(() => import('catalog/mount')),
  // @ts-expect-error federated module
  checkout: () => loadRemote(() => import('checkout/mount')),
  // @ts-expect-error federated module
  reviews: () => loadRemote(() => import('reviews/mount')),
}

createRoot(document.getElementById('root')!).render(<HostApp mode="mf" loaders={loaders} />)
