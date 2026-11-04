import { createRoot } from 'react-dom/client'
import { HostApp, type Loaders } from '../../shared/HostApp'
// Build-time integration: the very same feature code, statically imported into ONE bundle.
import * as catalog from '../../mf/catalog/src/mount'
import * as checkout from '../../mf/checkout/src/mount'
import * as reviews from '../../mf/reviews/src/mount'

const loaders: Loaders = {
  catalog: async () => catalog,
  checkout: async () => checkout,
  reviews: async () => reviews,
}

createRoot(document.getElementById('root')!).render(<HostApp mode="monolith" loaders={loaders} />)