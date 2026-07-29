import { useTranslation } from "react-i18next";
import { Phone, Mail } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const SupportInfo = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold">{t('myAccount.support.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {t('myAccount.support.phoneSupport')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('myAccount.support.phoneHours')}
                </p>
              </div>
            </div>
            <p className="text-base sm:text-lg font-semibold mb-2">
              {t('myAccount.support.phoneNumber')}
            </p>
            <Button variant="outline" className="w-full">
              {t('myAccount.support.callNow')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-chart-2" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {t('myAccount.support.emailSupport')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('myAccount.support.emailResponse')}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base mb-2">{t('myAccount.support.emailAddress')}</p>
            <Button variant="outline" className="w-full">
              {t('myAccount.support.sendEmail')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t('myAccount.support.faq')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm sm:text-base">
              {t('myAccount.support.faq1.question')}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('myAccount.support.faq1.answer')}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm sm:text-base">
              {t('myAccount.support.faq2.question')}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('myAccount.support.faq2.answer')}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm sm:text-base">
              {t('myAccount.support.faq3.question')}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('myAccount.support.faq3.answer')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
