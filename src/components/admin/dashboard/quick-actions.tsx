import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import {
  IconPlus,
  IconShoppingCart,
  IconPackage,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

/**
 * M6 — Quick actions. Navigation shortcuts to existing admin routes.
 */
export function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      key: "addProduct",
      icon: IconPlus,
      onClick: () => navigate("/admin/products"),
      primary: true,
    },
    {
      key: "viewOrders",
      icon: IconShoppingCart,
      onClick: () => navigate("/admin/orders"),
      primary: false,
    },
    {
      key: "manageStock",
      icon: IconPackage,
      onClick: () => navigate("/admin/products"),
      primary: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("quickActions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {actions.map(({ key, icon: Icon, onClick, primary }) => (
          <Button
            key={key}
            variant={primary ? "default" : "outline"}
            className="justify-start"
            onClick={onClick}
          >
            <Icon className="size-4" />
            {t(`quickActions.${key}`)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
