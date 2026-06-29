export const getEffectivePrice = (item) => {
  const basePrice = Number(item?.price ?? item?.product_price ?? 0)
  const salePrice = Number(item?.sale_price)

  if (Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice) {
    return salePrice
  }

  return basePrice
}

export const hasDiscount = (item) => {
  const basePrice = Number(item?.price ?? 0)
  const salePrice = Number(item?.sale_price)
  return Number.isFinite(salePrice) && salePrice > 0 && salePrice < basePrice
}