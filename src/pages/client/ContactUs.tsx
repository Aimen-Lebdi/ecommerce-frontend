import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin } from "lucide-react";
import { SupportInfo } from "../../components/client/SupportInfo";

// Hero Section
const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary via-primary/50 to-purple-600 dark:from-primary dark:via-purple-700 dark:to-blue-900 rounded-2xl mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-2 bg-white/25 dark:bg-white/35 text-white rounded-full text-sm font-medium mb-4 backdrop-blur-md">
            {t("contact.hero.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            {t("contact.hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/95 dark:text-white mb-8">
            {t("contact.hero.subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
};

// Contact Info Section
const ContactInfoSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("contact.info.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("contact.info.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-8 text-center border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
              <Phone className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("contact.info.phone")}</h3>
            <p className="text-muted-foreground">{t("contact.info.phoneValue")}</p>
            <p className="text-sm text-muted-foreground">{t("contact.info.phoneHours")}</p>
          </div>

          <div className="bg-card rounded-xl p-8 text-center border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-chart-2/10 rounded-xl flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-chart-2" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("contact.info.email")}</h3>
            <p className="text-muted-foreground">{t("contact.info.emailValue")}</p>
            <p className="text-sm text-muted-foreground">{t("contact.info.emailResponse")}</p>
          </div>

          <div className="bg-card rounded-xl p-8 text-center border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("contact.info.address")}</h3>
            <p className="text-muted-foreground">{t("contact.info.addressValue")}</p>
            <p className="text-sm text-muted-foreground">{t("contact.info.addressDetail")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Support Info Section (reuses shared component)
const SupportSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-muted/50 rounded-2xl mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("contact.supportInfo.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("contact.supportInfo.description")}
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <SupportInfo />
        </div>
      </div>
    </section>
  );
};

// Main Contact Us Page Component
const ContactUsPage = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <HeroSection />
        <ContactInfoSection />
        <SupportSection />
      </div>
    </div>
  );
};

export default ContactUsPage;
