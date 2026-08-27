import {
  Package,
  Truck,
  Shield,
  CreditCard,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-muted/30">
      {/* Trust Badges */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Truck className="h-8 w-8 text-primary" />
              <p className="font-semibold text-sm">{t('footer.trustBadges.cod.title')}</p>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.cod.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Package className="h-8 w-8 text-primary" />
              <p className="font-semibold text-sm">{t('footer.trustBadges.delivery.title')}</p>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.delivery.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-8 w-8 text-primary" />
              <p className="font-semibold text-sm">{t('footer.trustBadges.securePayment.title')}</p>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.securePayment.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Phone className="h-8 w-8 text-primary" />
              <p className="font-semibold text-sm">{t('footer.trustBadges.support.title')}</p>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.support.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="" width={128} height={128} />
              </div>
              <img src="/shopName.png" alt="" width={130} height={64} className="h-8 w-auto" />
              {/* <span className="font-bold text-xl">{t('footer.logo')}</span> */}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.companyDescription')}
            </p>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">{t('footer.customerService.title')}</h2>
            <ul className="space-y-2 text-sm">
              <li><Link to="/my-account" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.trackOrder')}</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.contactUs')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">{t('footer.company.title')}</h2>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">{t('footer.company.aboutUs')}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods & Legal */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 rtl:md:space-x-reverse">
              <p className="text-sm text-muted-foreground">
                {t('footer.copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm text-muted-foreground">{t('footer.paymentMethods.title')}</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CreditCard className="h-6 w-10 bg-muted rounded p-1" />
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">VISA</div>
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">MC</div>
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">COD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}