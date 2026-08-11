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

export function localDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function nextHalfHour(now = new Date()) {
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() < 30 ? 30 : 60);
  return localDateTime(next);
}

export function addMinutes(value: string, minutes: number) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);
  return localDateTime(date);
}
