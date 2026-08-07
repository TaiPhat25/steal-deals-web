export function unitsExpiringToday(
  products: { expiryDate: string; quantityRemaining: number }[],
  today = new Date(),
) {
  return products
    .filter((product) => new Date(product.expiryDate).toDateString() === today.toDateString())
    .reduce((sum, product) => sum + product.quantityRemaining, 0);
}

export function oldestOrdersFirst<T extends { createdAt: string }>(orders: T[]) {
  return [...orders].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}
