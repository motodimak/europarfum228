const STORAGE_KEY = 'adminProductStore'

const emptyStore = () => ({
  products: [],
  deletedIds: [],
})

const readJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    return fallback
  }
}

export const readProductStore = () => {
  if (typeof window === 'undefined') return emptyStore()
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = readJson(raw, emptyStore())
  return {
    products: Array.isArray(parsed.products) ? parsed.products : [],
    deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
  }
}

export const writeProductStore = (store) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    products: Array.isArray(store.products) ? store.products : [],
    deletedIds: Array.isArray(store.deletedIds) ? store.deletedIds : [],
  }))
}

export const isLocalProductId = (id) => typeof id === 'string' && id.startsWith('local-')

export const createLocalProductId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const upsertProduct = (product) => {
  const store = readProductStore()
  const filteredProducts = store.products.filter((item) => item.id !== product.id)
  const deletedIds = store.deletedIds.filter((deletedId) => deletedId !== product.id)
  const nextStore = {
    products: [product, ...filteredProducts],
    deletedIds,
  }
  writeProductStore(nextStore)
  return nextStore
}

export const removeProduct = (id) => {
  const store = readProductStore()
  const isLocal = isLocalProductId(id) || store.products.some((item) => item.id === id)
  const nextProducts = store.products.filter((item) => item.id !== id)
  const nextDeletedIds = isLocal
    ? store.deletedIds.filter((deletedId) => deletedId !== id)
    : Array.from(new Set([...store.deletedIds, id]))

  const nextStore = {
    products: nextProducts,
    deletedIds: nextDeletedIds,
  }
  writeProductStore(nextStore)
  return nextStore
}

export const mergeProducts = (remoteProducts = []) => {
  const store = readProductStore()
  const remoteById = new Map(remoteProducts.map((product) => [product.id, product]))
  const localById = new Map(store.products.map((product) => [product.id, product]))

  const mergedRemote = remoteProducts
    .filter((product) => !store.deletedIds.includes(product.id))
    .map((product) => localById.get(product.id) || product)

  const localOnly = store.products.filter((product) => !remoteById.has(product.id))

  return [...localOnly, ...mergedRemote]
}

export const getMergedProductById = (remoteProducts = [], id) => {
  const merged = mergeProducts(remoteProducts)
  return merged.find((product) => product.id === id) || null
}
