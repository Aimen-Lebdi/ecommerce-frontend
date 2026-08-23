import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import {
  IconClipboardList,
  IconInfoCircle,
  IconLock,
  IconMapPin,
  IconMoneybag,
  IconPackage,
  IconStatusChange,
  IconTruck,
} from "@tabler/icons-react";
import AddressCascadeFields, {
  type AddressLocation,
} from "../../client/AddressCascadeFields";
import {
  formatPhoneForDisplay,
  isCompleteLocalPhone,
  maskPhoneChange,
  phoneToLocalDigits,
} from "../../../utils/phoneFormat";
import type { Order } from "../../../features/orders/ordersSlice";
import type { UpdateOrderPayload } from "../../../features/orders/ordersAPI";

// ---------------------------------------------------------------------------
// Delivery-status rules for the dialog — derived from the backend's
// `backend/utils/orderStatusTransitions.js` (single source of truth) plus the
// locked confirm/cancel design (plan M5):
//   pending   → [confirmed, cancelled]
//   confirmed → [cancelled] (+ "confirmed" retry option when no parcel exists)
//   shipped+  → next forward step only (forward chain)
//   terminal  → locked (cancelled/failed/returned/completed have no moves)
// `confirmed`/`cancelled` moves are owned by dedicated confirm/cancel
// endpoints (auto-ship + auto-simulate), never by a plain status edit.
// ---------------------------------------------------------------------------
type OrderDeliveryStatus = Order["deliveryStatus"];

const TERMINAL_STATES: readonly OrderDeliveryStatus[] = [
  "cancelled",
  "failed",
  "returned",
  "completed",
];

const FORWARD_CHAIN: readonly OrderDeliveryStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "completed",
];

const isTerminalState = (state: OrderDeliveryStatus): boolean =>
  TERMINAL_STATES.includes(state);

/** Status options offered by the dialog for the given current status. */
const getDialogStatusOptions = (
  current: OrderDeliveryStatus,
  hasTrackingNumber: boolean
): OrderDeliveryStatus[] => {
  if (current === "pending") return ["confirmed", "cancelled"];
  if (current === "confirmed") {
    // "confirmed" doubles as the RETRY option when a previous confirm failed
    // before a parcel was created (i.e. no tracking number yet).
    return hasTrackingNumber ? ["cancelled"] : ["confirmed", "cancelled"];
  }
  if (isTerminalState(current)) return [];
  // shipped+ (forward states): only the next step in the forward chain.
  const idx = FORWARD_CHAIN.indexOf(current);
  return idx >= 0 && idx < FORWARD_CHAIN.length - 1
    ? [FORWARD_CHAIN[idx + 1]]
    : [];
};

// i18n key suffix per status value (orders.status.* keys already exist).
const STATUS_I18N_KEY: Record<OrderDeliveryStatus, string> = {
  pending: "pending",
  confirmed: "confirmed",
  shipped: "shipped",
  in_transit: "inTransit",
  out_for_delivery: "outForDelivery",
  delivered: "delivered",
  completed: "completed",
  failed: "failed",
  returned: "returned",
  cancelled: "cancelled",
};

// ---------------------------------------------------------------------------
// Local editable cart item (quantity/color are the only mutable fields; price
// stays frozen).
// ---------------------------------------------------------------------------
interface EditableItem {
  key: string; // cart-item _id (React key)
  productId: string; // product._id (used in the PUT payload)
  name: string;
  mainImage?: string;
  price: number;
  quantity: string;
  color: string;
  originalQuantity: number;
  originalColor: string;
}

type Errors = {
  wilaya?: boolean;
  dayra?: boolean;
  baladiya?: boolean;
  phone?: string;
  shippingPrice?: string;
  items?: Record<string, string>;
};

/**
 * Payload handed to `onSave`. Identical to the PUT payload; cancellation is
 * routed to the dedicated cancel endpoint (no reason field in the UI).
 */
export type OrderEditSavePayload = UpdateOrderPayload;

interface OrderEditDialogProps {
  /**
   * Kept for parity with the other admin dialogs (UserDialog/CategoryDialog).
   * The order edit dialog is always used in "edit" mode.
   */
  mode?: "edit";
  existingData?: Order;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: OrderEditSavePayload) => Promise<void>;
  isLoading?: boolean;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Inline lock notice shown for card orders on the read-only tabs. */
function LockNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-muted-foreground">
      <IconLock className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
}

export function OrderEditDialog({
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSave,
  isLoading = false,
}: OrderEditDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Form state
  const [deliveryStatus, setDeliveryStatus] =
    React.useState<OrderDeliveryStatus>("pending");
  const [shippingAddress, setShippingAddress] = React.useState<AddressLocation>({
    wilaya: "",
    dayra: "",
    baladiya: "",
  });
  const [phone, setPhone] = React.useState(""); // masked display value
  const [items, setItems] = React.useState<EditableItem[]>([]);
  const [shippingPrice, setShippingPrice] = React.useState("");
  const [trackingNumber, setTrackingNumber] = React.useState("");

  const [activeTab, setActiveTab] = React.useState("status");
  const [errors, setErrors] = React.useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Card orders are data read-only: only the delivery status can be updated.
  const isCard = existingData?.paymentMethodType === "card";

  // Populate the form whenever the dialog opens for an order.
  React.useEffect(() => {
    if (open && existingData) {
      setDeliveryStatus(existingData.deliveryStatus);
      setShippingAddress({
        wilaya: existingData.shippingAddress?.wilaya || "",
        dayra: existingData.shippingAddress?.dayra || "",
        baladiya: existingData.shippingAddress?.baladiya || "",
      });
      setPhone(
        formatPhoneForDisplay(existingData.shippingAddress?.phone || "")
      );
      setItems(
        existingData.cartItems.map((item) => ({
          key: item._id,
          productId: item.product?._id || item._id,
          name: item.product?.name || "",
          mainImage: item.product?.mainImage,
          price: item.price || 0,
          quantity: String(item.quantity),
          color: item.color || "",
          originalQuantity: item.quantity,
          originalColor: item.color || "",
        }))
      );
      setShippingPrice(
        existingData.shippingPrice != null
          ? String(existingData.shippingPrice)
          : "0"
      );
      setTrackingNumber(existingData.trackingNumber || "");
      setErrors({});
      setActiveTab("status");
    }
  }, [open, existingData]);

  const statusOptions = getDialogStatusOptions(
    deliveryStatus,
    !!existingData?.trackingNumber
  );
  const statusLocked = statusOptions.length === 0;

  // True when the order is already `confirmed` but has no parcel yet: the Save
  // button then RETRIES the confirm (create parcel + auto-simulate) instead of
  // performing a plain status edit. Matches prepareUpdatePayload's isRetryConfirm.
  const isRetryConfirmCase =
    existingData?.deliveryStatus === "confirmed" &&
    deliveryStatus === "confirmed" &&
    !existingData?.trackingNumber;

  // Derived totals — recomputed live; per-item price and tax are frozen.
  const subtotal = items.reduce(
    (sum, item) => sum + (parseInt(item.quantity, 10) || 0) * item.price,
    0
  );
  const taxPrice = existingData?.taxPrice || 0;
  const parsedShippingPrice = Number.isNaN(parseFloat(shippingPrice))
    ? 0
    : parseFloat(shippingPrice);
  const derivedTotal = round2(subtotal + parsedShippingPrice + taxPrice);

  const statusLabel = (status: OrderDeliveryStatus): string =>
    t(`orders.status.${STATUS_I18N_KEY[status]}`);

  const validate = (): boolean => {
    const e: Errors = {};

    if (!isCard) {
      // Shipping address (cascade fields)
      if (!shippingAddress.wilaya.trim()) e.wilaya = true;
      if (!shippingAddress.dayra.trim()) e.dayra = true;
      if (!shippingAddress.baladiya.trim()) e.baladiya = true;

      // Phone (mirrors backend isMobilePhone ar-DZ / local digits rule)
      if (!isCompleteLocalPhone(phone)) {
        e.phone = t("orders.editDialog.errors.phoneRequired");
      }

      // Cart items: quantity must be a positive integer
      const itemErrors: Record<string, string> = {};
      items.forEach((item) => {
        const qty = parseInt(item.quantity, 10);
        if (
          item.quantity.trim() === "" ||
          !Number.isInteger(qty) ||
          qty < 1
        ) {
          itemErrors[item.key] = t("orders.editDialog.errors.quantityMin");
        }
      });
      if (Object.keys(itemErrors).length > 0) e.items = itemErrors;

      // Shipping price must be >= 0
      const sp = parseFloat(shippingPrice);
      if (shippingPrice.trim() === "" || Number.isNaN(sp) || sp < 0) {
        e.shippingPrice = t("orders.editDialog.errors.shippingPriceMin");
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const prepareUpdatePayload = (): OrderEditSavePayload => {
    const payload: OrderEditSavePayload = {};

    // Status progression (cash + card share the Status tab). `confirmed` from
    // an already-confirmed order without a parcel is a RETRY — keep it in the
    // payload so the page routes to the confirm endpoint again.
    if (existingData) {
      const isRetryConfirm =
        existingData.deliveryStatus === "confirmed" &&
        deliveryStatus === "confirmed" &&
        !existingData.trackingNumber;
      if (deliveryStatus !== existingData.deliveryStatus || isRetryConfirm) {
        payload.deliveryStatus = deliveryStatus;
      }
    }

    // Cash-only editable fields (card orders reject these server-side)
    if (!isCard && existingData) {
      // Shipping address — only when something changed
      const address = {
        wilaya: shippingAddress.wilaya.trim(),
        dayra: shippingAddress.dayra.trim(),
        baladiya: shippingAddress.baladiya.trim(),
        phone: phoneToLocalDigits(phone),
      };
      const original = existingData.shippingAddress;
      if (
        address.wilaya !== original.wilaya ||
        address.dayra !== original.dayra ||
        address.baladiya !== original.baladiya ||
        address.phone !== original.phone
      ) {
        payload.shippingAddress = address;
      }

      // Cart items — only include rows whose quantity/color changed
      const changedItems = items.filter(
        (item) =>
          parseInt(item.quantity, 10) !== item.originalQuantity ||
          item.color.trim() !== item.originalColor
      );
      if (changedItems.length > 0) {
        payload.cartItems = changedItems.map((item) => ({
          _id: item.productId,
          quantity: parseInt(item.quantity, 10),
          ...(item.color.trim() ? { color: item.color.trim() } : {}),
        }));
      }

      // Shipping price
      if (parsedShippingPrice !== existingData.shippingPrice) {
        payload.shippingPrice = parsedShippingPrice;
      }

      // Tracking number
      if (trackingNumber.trim() !== (existingData.trackingNumber || "")) {
        payload.trackingNumber = trackingNumber.trim();
      }
    }

    return payload;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = prepareUpdatePayload();
    if (Object.keys(payload).length === 0) {
      setOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave?.(payload);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update order:", error);
      // Keep the dialog open so the seller can retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      setErrors({});
    }
    setOpen(newOpen);
  };

  const isDisabled = isLoading || isSubmitting;

  const handleQuantityChange = (key: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: value } : item
      )
    );
    setErrors((prev) => {
      if (!prev.items) return prev;
      const next = { ...prev.items };
      delete next[key];
      return { ...prev, items: next };
    });
  };

  const handleColorChange = (key: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, color: value } : item))
    );
  };

  const addressErrors: Partial<Record<keyof AddressLocation, boolean>> = {
    wilaya: !!errors.wilaya,
    dayra: !!errors.dayra,
    baladiya: !!errors.baladiya,
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t("orders.editDialog.title", {
              id: existingData?._id.slice(-8).toUpperCase() || "",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("orders.editDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="status">
              <IconStatusChange className="h-4 w-4" />
              {t("orders.editDialog.tabs.status")}
            </TabsTrigger>
            <TabsTrigger value="address">
              <IconMapPin className="h-4 w-4" />
              {t("orders.editDialog.tabs.address")}
            </TabsTrigger>
            <TabsTrigger value="items">
              <IconClipboardList className="h-4 w-4" />
              {t("orders.editDialog.tabs.items")}
            </TabsTrigger>
            <TabsTrigger value="amounts">
              <IconMoneybag className="h-4 w-4" />
              {t("orders.editDialog.tabs.amounts")}
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <IconTruck className="h-4 w-4" />
              {t("orders.editDialog.tabs.tracking")}
            </TabsTrigger>
          </TabsList>

          {/* ---------- Status tab (active for cash AND card) ---------- */}
          <TabsContent value="status" className="space-y-4">
            {isCard && (
              <LockNotice
                title={t("orders.editDialog.lockNoticeTitle")}
                description={t("orders.editDialog.lockNotice")}
              />
            )}

            <div className="grid gap-2">
              <Label htmlFor="ord-delivery-status">
                {t("orders.editDialog.labels.deliveryStatus")}
              </Label>
              <Select
                value={deliveryStatus}
                onValueChange={(value) =>
                  setDeliveryStatus(value as OrderDeliveryStatus)
                }
                disabled={statusLocked}
              >
                <SelectTrigger id="ord-delivery-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={deliveryStatus} disabled>
                    {isRetryConfirmCase
                      ? t("orders.editDialog.retryConfirm")
                      : statusLabel(deliveryStatus)}{" "}
                    {t("orders.editDialog.currentStatus")}
                  </SelectItem>
                  {statusOptions
                    .filter((status) => status !== deliveryStatus)
                    .map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabel(status)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {statusLocked && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconLock className="h-3 w-3" />
                  {t("orders.editDialog.terminalLocked")}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ord-tracking-number">
                {t("orders.editDialog.labels.trackingNumber")}
              </Label>
              <Input
                id="ord-tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t("orders.editDialog.placeholders.trackingNumber")}
                disabled={isCard}
              />
            </div>

          </TabsContent>

          {/* ---------- Address tab ---------- */}
          <TabsContent value="address" className="space-y-4">
            {isCard ? (
              <LockNotice
                title={t("orders.editDialog.lockNoticeTitle")}
                description={t("orders.editDialog.lockNotice")}
              />
            ) : (
              <>
                <AddressCascadeFields
                  idPrefix="ord"
                  value={shippingAddress}
                  onChange={(field, value) => {
                    setShippingAddress((prev) => ({
                      ...prev,
                      [field]: value,
                    }));
                    setErrors((prev) => ({ ...prev, [field]: undefined }));
                  }}
                  errors={addressErrors}
                />
                <div className="grid gap-2">
                  <Label htmlFor="ord-phone">
                    {t("orders.editDialog.labels.phone")}
                  </Label>
                  <Input
                    id="ord-phone"
                    value={phone}
                    onChange={(e) =>
                      setPhone(maskPhoneChange(e.target.value))
                    }
                    placeholder={t("orders.editDialog.placeholders.phone")}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* ---------- Items tab ---------- */}
          <TabsContent value="items" className="space-y-4">
            {isCard ? (
              <LockNotice
                title={t("orders.editDialog.lockNoticeTitle")}
                description={t("orders.editDialog.lockNotice")}
              />
            ) : (
              <>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconInfoCircle className="h-3 w-3" />
                  {t("orders.editDialog.items.frozenNote")}
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      <img
                        src={item.mainImage}
                        alt={item.name}
                        className="h-16 w-16 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("orders.editDialog.items.price")}:{" "}
                          {item.price.toFixed(2)} DZD
                        </p>
                        {errors.items?.[item.key] && (
                          <p className="mt-1 text-sm text-destructive">
                            {errors.items[item.key]}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor={`ord-qty-${item.key}`}>
                          {t("orders.editDialog.items.quantity")}
                        </Label>
                        <Input
                          id={`ord-qty-${item.key}`}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.key, e.target.value)
                          }
                          className={`w-20 ${errors.items?.[item.key] ? "border-destructive" : ""}`}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor={`ord-color-${item.key}`}>
                          {t("orders.editDialog.items.color")}
                        </Label>
                        <Input
                          id={`ord-color-${item.key}`}
                          value={item.color}
                          onChange={(e) =>
                            handleColorChange(item.key, e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ---------- Amounts tab ---------- */}
          <TabsContent value="amounts" className="space-y-3">
            {isCard ? (
              <LockNotice
                title={t("orders.editDialog.lockNoticeTitle")}
                description={t("orders.editDialog.lockNotice")}
              />
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("orders.editDialog.amounts.subtotal")}
                  </span>
                  <span className="font-medium">
                    {subtotal.toFixed(2)} DZD
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="ord-shipping-price">
                    {t("orders.editDialog.amounts.shipping")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="ord-shipping-price"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={shippingPrice}
                      onChange={(e) => setShippingPrice(e.target.value)}
                      className={`w-32 text-right ${errors.shippingPrice ? "border-destructive" : ""}`}
                    />
                    <span className="text-sm text-muted-foreground">DZD</span>
                  </div>
                </div>
                {errors.shippingPrice && (
                  <p className="text-sm text-destructive">
                    {errors.shippingPrice}
                  </p>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("orders.editDialog.amounts.tax")}
                  </span>
                  <span className="font-medium">{taxPrice.toFixed(2)} DZD</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>{t("orders.editDialog.amounts.total")}</span>
                  <span>{derivedTotal.toFixed(2)} DZD</span>
                </div>
                {existingData?.paymentMethodType === "cash" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("orders.editDialog.amounts.codAmount")}
                    </span>
                    <span className="font-medium">
                      {derivedTotal.toFixed(2)} DZD
                    </span>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ---------- Tracking tab ---------- */}
          <TabsContent value="tracking" className="space-y-4">
            {isCard ? (
              <LockNotice
                title={t("orders.editDialog.lockNoticeTitle")}
                description={t("orders.editDialog.lockNotice")}
              />
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="ord-tracking-number-2">
                    {t("orders.editDialog.labels.trackingNumber")}
                  </Label>
                  <Input
                    id="ord-tracking-number-2"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={t(
                      "orders.editDialog.placeholders.trackingNumber"
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("orders.editDialog.tracking.agency")}</Label>
                  <p className="text-sm font-medium">
                    {existingData?.deliveryAgency?.name ||
                      t("orders.editDialog.tracking.agencyPlaceholder")}
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDisabled}
          >
            {t("orders.editDialog.buttons.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isDisabled}>
            <IconPackage className="mr-2 h-4 w-4" />
            {isDisabled
              ? t("orders.editDialog.buttons.saving")
              : t("orders.editDialog.buttons.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
