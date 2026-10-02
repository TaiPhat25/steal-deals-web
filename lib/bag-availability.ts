export type BagAvailabilityFields = {
  status: string;
  quantityRemaining: number;
  expiryDate: string;
  pickupEndTime: string;
};

export function isBagAvailable(
  bag: BagAvailabilityFields,
  now = Date.now(),
) {
  const expiryTime = Date.parse(bag.expiryDate);
  const pickupEndTime = Date.parse(bag.pickupEndTime);

  return (
    bag.status.toLowerCase() === "active" &&
    bag.quantityRemaining > 0 &&
    Number.isFinite(expiryTime) &&
    expiryTime > now &&
    Number.isFinite(pickupEndTime) &&
    pickupEndTime > now
  );
}

export function filterAvailableBags<T extends BagAvailabilityFields>(
  bags: T[],
  now = Date.now(),
) {
  return bags.filter((bag) => isBagAvailable(bag, now));
}
