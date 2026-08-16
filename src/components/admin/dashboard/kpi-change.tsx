import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface KpiChangeProps {
  total: number;
  // null/undefined when the previous period had no baseline to compare against
  percentageChange: number | null | undefined;
  trend: "up" | "down" | "neutral";
  // i18n key for the percentage caption, interpolated with {{percentage}}
  changeTextKey: string;
}

// Renders the comparison line under a dashboard KPI card.
// - No previous-period baseline + current data -> green "New"
// - No previous-period baseline + no data -> muted "No data"
// - Otherwise -> colored arrow + percentage vs previous period
export function KpiChange({
  total,
  percentageChange,
  trend,
  changeTextKey,
}: KpiChangeProps) {
  const { t } = useTranslation();

  if (percentageChange == null) {
    if (total > 0) {
      return (
        <p className="text-xs flex items-center gap-1 text-green-500">
          <IconTrendingUp className="w-4 h-4" />
          {t("cards.new")}
        </p>
      );
    }
    return (
      <p className="text-xs flex items-center gap-1 text-muted-foreground">
        {t("cards.noData")}
      </p>
    );
  }

  const isUp = trend === "up";
  const isDown = trend === "down";
  const color = isUp
    ? "text-green-500"
    : isDown
      ? "text-red-500"
      : "text-muted-foreground";
  const percentageLabel =
    percentageChange > 0 ? `+${percentageChange}` : String(percentageChange);

  return (
    <p className={`text-xs flex items-center gap-1 ${color}`}>
      {isUp ? (
        <IconTrendingUp className="w-4 h-4" />
      ) : isDown ? (
        <IconTrendingDown className="w-4 h-4" />
      ) : null}
      {t(changeTextKey, { percentage: percentageLabel })}
    </p>
  );
}
