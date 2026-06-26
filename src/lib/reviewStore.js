const STORAGE_KEY = 'productReviews'

const readJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

export const readReviews = () => {
  if (typeof window === 'undefined') return []
  return readJson(localStorage.getItem(STORAGE_KEY), [])
}

export const getProductReviews = (productId) => {
  const reviews = readReviews()
  return reviews.filter((review) => review.product_id === productId)
}

export const getAverageRating = (productId) => {
  const reviews = getProductReviews(productId)
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
}

export const getReviewCount = (productId) => {
  return getProductReviews(productId).length
}

export const getUserReview = (productId, userId) => {
  if (!userId) return null
  const reviews = readReviews()
  return reviews.find((review) => review.product_id === productId && review.user_id === userId) || null
}

export const getReviewsByUser = (userId) => {
  if (!userId) return []
  const reviews = readReviews()
  return reviews.filter((review) => review.user_id === userId)
}

export const saveProductReview = (review) => {
  const existing = readReviews()
  const next = existing.filter((item) => !(item.product_id === review.product_id && item.user_id === review.user_id))
  next.unshift({
    ...review,
    id: review.id || `review-${Date.now()}`,
    created_at: review.created_at || new Date().toISOString(),
  })
  writeJson(next)
  return next
}
