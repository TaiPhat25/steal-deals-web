export function getOrderStatusLabel(status: string) {
  if (status === "NoShow") return "Not collected";
  if (status === "ReadyForPickup") return "Ready for pickup";
  if (status === "InventoryReservationFailed") return "Inventory unavailable";
  if (status === "PaymentFailed") return "Payment failed";
  return status;
}

export function canReviewOrder(status: string) {
  return status === "Confirmed";
}

export function isSettledOrderStatus(status: string) {
  return ["Confirmed", "NoShow", "PaymentFailed", "InventoryReservationFailed", "Cancelled"].includes(status);
}

export function getReceivedPaymentDescription(orderStatus: string | undefined) {
  if (orderStatus === "NoShow") {
    return "Your payment was successful. The store marked this order as not collected before the pickup deadline.";
  }
  if (orderStatus === "Confirmed") {
    return "Your payment and order are confirmed. Check your order's pickup or delivery information for the next steps.";
  }
  if (!orderStatus || orderStatus === "Pending") {
    return "VNPAY has accepted the payment. The order confirmation event may still be processing.";
  }
  return "Your payment was successful. Please check the order status or contact the store for help.";
}
