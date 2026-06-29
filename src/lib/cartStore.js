const STORAGE_KEY = 'localCartItems'

const readJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    return fallback
  }
}

export const isLocalCartItemId = (id) => typeof id === 'string' && id.startsWith('local-cart-')

export const readLocalCartItems = () => {
  if (typeof window === 'undefined') return []
  const parsed = readJson(localStorage.getItem(STORAGE_KEY), [])
  return Array.isArray(parsed) ? parsed : []
}

export const writeLocalCartItems = (items) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(items) ? items : []))
}

export const addLocalCartItem = (item) => {
  const current = readLocalCartItems()
  const existing = current.find((it) => it.product_id === item.product_id)

  let next
  if (existing) {
    next = current.map((it) =>
      it.product_id === item.product_id
        ? {
            ...it,
            quantity: (it.quantity || 1) + 1,
            product_price: item.product_price,
            product_name: item.product_name,
            product_image: item.product_image,
            product_volume: item.product_volume,
            product_category: item.product_category,
            product_gender: item.product_gender,
          }
        : it
    )
  } else {
    next = [
      {
        id: `local-cart-${item.product_id}`,
        quantity: 1,
        ...item,
      },
      ...current,
    ]
  }

  writeLocalCartItems(next)
  return next
}

export const updateLocalCartItemQuantity = (id, nextQty) => {
  const current = readLocalCartItems()
  const next = nextQty <= 0
    ? current.filter((it) => it.id !== id)
    : current.map((it) => (it.id === id ? { ...it, quantity: nextQty } : it))

  writeLocalCartItems(next)
  return next
}

export const removeLocalCartItem = (id) => {
  const current = readLocalCartItems()
  const next = current.filter((it) => it.id !== id)
  writeLocalCartItems(next)
  return next
}

export const clearLocalCart = () => {
  writeLocalCartItems([])
}

export const mergeCartItems = (remoteItems = []) => {
  const local = readLocalCartItems()
  return [...remoteItems, ...local]
}
