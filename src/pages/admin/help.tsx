import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

// FAQ items rendered from the `help.sections.operations.items` translations
const faqKeys = [
  "addProduct",
  "updateStock",
  "organizeProducts",
  "handleOrder",
] as const;

// Order statuses rendered from the `help.sections.orderStatuses.statuses` translations
const orderStatusKeys = [
  "pending",
  "confirmed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "failed",
  "returned",
] as const;

export default function AdminHelp() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">{t('help.title')}</h1>
            <p className="text-muted-foreground">{t('help.subtitle')}</p>
          </div>

          <div className="flex flex-col gap-4 px-4 lg:px-6">
            {/* Manage your store FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>{t('help.sections.operations.title')}</CardTitle>
                <CardDescription>
                  {t('help.sections.operations.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {faqKeys.map((key) => (
                  <div key={key} className="grid gap-1">
                    <h3 className="font-medium">
                      {t(`help.sections.operations.items.${key}.q`)}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t(`help.sections.operations.items.${key}.a`)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order statuses glossary */}
            <Card>
              <CardHeader>
                <CardTitle>{t('help.sections.orderStatuses.title')}</CardTitle>
                <CardDescription>
                  {t('help.sections.orderStatuses.intro')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm font-medium">
                  {t('help.sections.orderStatuses.chain')}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {orderStatusKeys.map((key) => (
                    <div
                      key={key}
                      className="rounded-lg border bg-muted/40 px-3 py-2"
                    >
                      <span className="text-sm font-medium">
                        {t(`help.sections.orderStatuses.statuses.${key}.label`)}
                      </span>
                      <p className="text-muted-foreground text-xs">
                        {t(`help.sections.orderStatuses.statuses.${key}.desc`)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Escalation / contact */}
            <Card>
              <CardHeader>
                <CardTitle>{t('help.sections.support.title')}</CardTitle>
                <CardDescription>
                  {t('help.sections.support.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  to="/contact"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t('help.sections.support.contactCta')}
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
