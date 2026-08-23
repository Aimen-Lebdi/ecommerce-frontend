import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../ui/table";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchLowStock,
  saveLowStockThreshold,
} from "../../../features/analytics/analyticsSlice";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

/**
 * M4 — Low-stock alerts. Lists products at or below the admin-configurable
 * threshold (stored in the Setting collection). Loaded + refreshed manually.
 */
export function LowStockList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    lowStock,
    lowStockThreshold,
    lowStockLoading,
    lowStockError,
  } = useAppSelector((state) => state.analytics);

  const [threshold, setThreshold] = React.useState<number>(lowStockThreshold);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchLowStock());
  }, [dispatch]);

  // Keep the local input in sync when the stored threshold changes
  React.useEffect(() => {
    setThreshold(lowStockThreshold);
  }, [lowStockThreshold]);

  const handleSave = async () => {
    const value = Number(threshold);
    if (isNaN(value) || value < 0) {
      toast.error(t("lowStock.toasts.invalidThreshold"));
      return;
    }
    setSaving(true);
    try {
      await dispatch(saveLowStockThreshold(value)).unwrap();
      toast.success(t("lowStock.toasts.saveSuccess"));
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message || t("lowStock.toasts.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">
          {t("lowStock.title")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("lowStock.thresholdLabel")}
            </span>
            <Input
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="h-8 w-20"
              aria-label={t("lowStock.thresholdLabel")}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t("lowStock.saving") : t("lowStock.save")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {lowStockError ? (
          <p className="text-sm text-destructive text-center py-6">
            {lowStockError}
          </p>
        ) : lowStockLoading && lowStock.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
        ) : lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {t("lowStock.empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("lowStock.headers.product")}</TableHead>
                <TableHead className="text-center">{t("lowStock.headers.qty")}</TableHead>
                <TableHead className="text-center">{t("lowStock.headers.sold")}</TableHead>
                <TableHead className="text-right">{t("lowStock.headers.price")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <span className="truncate max-w-[180px] block" title={product.name}>
                      {product.name}
                    </span>
                    {product.category && (
                      <span className="text-xs text-muted-foreground">
                        {product.category}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={product.quantity === 0 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {product.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {product.sold}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {product.price.toLocaleString()} DZD
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
