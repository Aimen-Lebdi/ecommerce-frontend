import { Button } from "../../ui/button";
import { IconDownload } from "@tabler/icons-react";
import { useAppSelector } from "../../../app/hooks";
import { useTranslation } from "react-i18next";

const escapeCsv = (value: unknown): string => {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * M6 — Client-side CSV export of the currently loaded dashboard tables.
 * The current date range (if any) is embedded in the filename.
 */
export function ExportButton() {
  const { t } = useTranslation();
  const { bestOrders, topCustomers, bestProducts, dateRange } = useAppSelector(
    (state) => state.analytics
  );

  const handleExport = () => {
    const rows: string[] = [];

    // Best Orders
    rows.push(`"${t("export.sheets.bestOrders")}"`);
    rows.push(
      [
        t("tables.bestOrders.headers.orderId"),
        t("tables.bestOrders.headers.customer"),
        t("tables.bestOrders.headers.total"),
        t("tables.bestOrders.headers.date"),
      ]
        .map(escapeCsv)
        .join(",")
    );
    bestOrders.forEach((order) =>
      rows.push([order.id, order.customer, order.total, order.date].map(escapeCsv).join(","))
    );

    rows.push("");

    // Top Customers
    rows.push(`"${t("export.sheets.topCustomers")}"`);
    rows.push(
      [
        t("tables.topCustomers.headers.customer"),
        t("tables.topCustomers.headers.orders"),
        t("tables.topCustomers.headers.revenue"),
      ]
        .map(escapeCsv)
        .join(",")
    );
    topCustomers.forEach((customer) =>
      rows.push([customer.name, customer.products, customer.revenue].map(escapeCsv).join(","))
    );

    rows.push("");

    // Best Products
    rows.push(`"${t("export.sheets.bestProducts")}"`);
    rows.push(
      [
        t("tables.bestProducts.headers.product"),
        t("tables.bestProducts.headers.unitsSold"),
        t("tables.bestProducts.headers.revenue"),
      ]
        .map(escapeCsv)
        .join(",")
    );
    bestProducts.forEach((product) =>
      rows.push([product.name, product.sold, product.revenue].map(escapeCsv).join(","))
    );

    const csv = rows.join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });

    const rangePart =
      dateRange?.startDate && dateRange?.endDate
        ? `-${dateRange.startDate}_${dateRange.endDate}`
        : "";
    const filename = `dashboard${rangePart}.csv`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={bestOrders.length === 0 && topCustomers.length === 0 && bestProducts.length === 0}
    >
      <IconDownload className="size-4" />
      {t("export.button")}
    </Button>
  );
}
