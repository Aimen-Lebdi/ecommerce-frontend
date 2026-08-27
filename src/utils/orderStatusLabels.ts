import type { TFunction } from "i18next";

/** "out_for_delivery" -> "outForDelivery" so enum values match locale keys. */
const snakeToCamel = (value: string) =>
  value.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Translated label for a raw delivery-status enum ("in_transit" etc).
 * Reuses the admin console's orders.status.* keys; falls back to the raw
 * value when a status has no translation yet.
 */
export function deliveryStatusLabel(
  t: TFunction,
  status?: string | null
): string {
  if (!status) {
    return t("orders.status.pending", { defaultValue: "Pending" });
  }
  return t(`orders.status.${snakeToCamel(status)}`, { defaultValue: status });
}

/** Translated label for a raw payment-status enum ("partially_refunded" etc). */
export function paymentStatusLabel(
  t: TFunction,
  status?: string | null
): string {
  if (!status) {
    return t("orders.paymentStatus.pending", { defaultValue: "Pending" });
  }
  return t(`orders.paymentStatus.${snakeToCamel(status)}`, {
    defaultValue: status,
  });
}
