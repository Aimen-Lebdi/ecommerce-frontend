import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setDateRange } from "../../../features/analytics/analyticsSlice";
import {
  getPresetRange,
  type DateRangePreset,
} from "../../../features/analytics/analyticsAPI";
import { IconCalendar } from "@tabler/icons-react";

/**
 * M1 — Global date-range picker. One picker drives all dashboard widgets.
 * Presets: Today / 7d / 30d / 90d / Custom (two date inputs). A cleared range
 * (null) falls back to the backend defaults for each widget.
 */
export function DateRangePicker({ className }: { className?: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const dateRange = useAppSelector((state) => state.analytics.dateRange);

  const [open, setOpen] = React.useState(false);
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");

  const applyPreset = (preset: Exclude<DateRangePreset, "custom">) => {
    dispatch(setDateRange(getPresetRange(preset)));
    setOpen(false);
  };

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    dispatch(setDateRange({ startDate: customStart, endDate: customEnd }));
    setOpen(false);
  };

  const clearRange = () => {
    dispatch(setDateRange(null));
    setCustomStart("");
    setCustomEnd("");
    setOpen(false);
  };

  const hasRange = Boolean(dateRange?.startDate && dateRange?.endDate);
  const label = hasRange
    ? `${dateRange!.startDate} – ${dateRange!.endDate}`
    : t("dateRange.selectRange");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <IconCalendar className="size-4" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{t("dateRange.title")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">{t("dateRange.title")}</p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("today")}
            >
              {t("dateRange.today")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("7d")}
            >
              {t("dateRange.last7Days")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("30d")}
            >
              {t("dateRange.last30Days")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("90d")}
            >
              {t("dateRange.last90Days")}
            </Button>
          </div>

          <div className="my-1 h-px bg-border" />

          <p className="text-sm font-medium">{t("dateRange.custom")}</p>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              aria-label={t("dateRange.startDate")}
            />
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              aria-label={t("dateRange.endDate")}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {hasRange ? (
              <Button variant="ghost" size="sm" onClick={clearRange}>
                {t("dateRange.clear")}
              </Button>
            ) : (
              <span />
            )}
            <Button
              size="sm"
              onClick={applyCustom}
              disabled={!customStart || !customEnd}
            >
              {t("dateRange.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
