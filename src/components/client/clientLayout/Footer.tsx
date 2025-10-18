import { 
  Package,
  Truck,
  Shield,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
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
              <h4 className="font-semibold text-sm">{t('footer.trustBadges.freeShipping.title')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.freeShipping.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Package className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-sm">{t('footer.trustBadges.easyReturns.title')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.easyReturns.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-sm">{t('footer.trustBadges.securePayment.title')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.securePayment.description')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Phone className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-sm">{t('footer.trustBadges.support.title')}</h4>
              <p className="text-xs text-muted-foreground">{t('footer.trustBadges.support.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="" />
              </div>
              <img src="/shopName.png" alt="" className=" h-8" />
              {/* <span className="font-bold text-xl">{t('footer.logo')}</span> */}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.companyDescription')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <MapPin className="h-4 w-4" />
                <span>{t('footer.address')}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone className="h-4 w-4" />
                <span>{t('footer.phone')}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="h-4 w-4" />
                <span>{t('footer.email')}</span>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.customerService.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.helpCenter')}</a></li>
              <li><a href="/shipping" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.shippingInfo')}</a></li>
              <li><a href="/returns" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.returnsExchanges')}</a></li>
              <li><a href="/size-guide" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.sizeGuide')}</a></li>
              <li><a href="/track-order" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.trackOrder')}</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-foreground">{t('footer.customerService.contactUs')}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.company.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-muted-foreground hover:text-foreground">{t('footer.company.aboutUs')}</a></li>
              <li><a href="/careers" className="text-muted-foreground hover:text-foreground">{t('footer.company.careers')}</a></li>
              <li><a href="/blog" className="text-muted-foreground hover:text-foreground">{t('footer.company.blog')}</a></li>
              <li><a href="/press" className="text-muted-foreground hover:text-foreground">{t('footer.company.press')}</a></li>
              <li><a href="/investors" className="text-muted-foreground hover:text-foreground">{t('footer.company.investors')}</a></li>
              <li><a href="/sustainability" className="text-muted-foreground hover:text-foreground">{t('footer.company.sustainability')}</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('footer.newsletter.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.newsletter.description')}
            </p>
            <div className="space-y-3">
              <Input placeholder={t('footer.newsletter.placeholder')} />
              <Button className="w-full">{t('footer.newsletter.subscribe')}</Button>
            </div>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
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
              <div className="flex space-x-4 rtl:space-x-reverse text-sm">
                <a href="/privacy" className="text-muted-foreground hover:text-foreground">{t('footer.legal.privacyPolicy')}</a>
                <a href="/terms" className="text-muted-foreground hover:text-foreground">{t('footer.legal.termsOfService')}</a>
                <a href="/cookies" className="text-muted-foreground hover:text-foreground">{t('footer.legal.cookiePolicy')}</a>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm text-muted-foreground">{t('footer.paymentMethods.title')}</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CreditCard className="h-6 w-10 bg-muted rounded p-1" />
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">VISA</div>
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">MC</div>
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">PP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}