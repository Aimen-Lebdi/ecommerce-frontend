/**
 * Canonical status styling for orders, shared by order confirmation,
 * order tracking and the account area. One source of truth for hue
 * assignments; every palette carries its dark-mode counterpart.
 */

/** Badge palette for delivery status (orderConfirmation + orderTracking). */
export function deliveryStatusBadgeClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
    case "shipped":
    case "in_transit":
    case "out_for_delivery":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900";
    case "delivered":
    case "completed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

/** Badge palette for payment status. */
export function paymentStatusBadgeClass(status: string): string {
  switch (status) {
    case "completed":
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900";
    case "pending":
    case "authorized":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900";
    case "failed":
    case "refunded":
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

/** Badge palette for payment method. */
export function paymentMethodBadgeClass(method: string): string {
  switch (method) {
    case "cash":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900";
    case "card":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

/**
 * Icon-tone palette for the tracking timeline's current-status medallion
 * (text/bg/border at lighter steps than the badge palette).
 */
export function statusToneClass(status: string): string {
  switch (status) {
    case "pending":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900";
    case "confirmed":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900";
    case "shipped":
    case "in_transit":
    case "out_for_delivery":
      return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900";
    case "delivered":
    case "completed":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900";
    case "failed":
    case "returned":
    case "cancelled":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900";
    default:
      return "text-muted-foreground bg-muted/50 border-border";
  }
}

/**
 * Chip palette for arbitrary status strings in the account area
 * (matches on substrings because historical statuses vary).
 */
export function orderStatusChipClass(status: string): string {
  const statusLower = status.toLowerCase();
  if (
    statusLower.includes("delivered") ||
    statusLower.includes("completed")
  ) {
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
  }
  if (statusLower.includes("shipped") || statusLower.includes("transit")) {
    return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
  }
  if (
    statusLower.includes("confirmed") ||
    statusLower.includes("processing")
  ) {
    return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
  }
  if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
  }
  return "text-muted-foreground bg-muted";
}
