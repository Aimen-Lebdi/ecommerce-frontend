import { useTranslation } from "react-i18next";
import {
  Users,
  Globe,
  Zap,
  Award,
  Banknote,
  Truck,
  Shield,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

// Stats Data — product capabilities we can prove (no invented numbers)
const stats = [
  {
    id: 1,
    number: "about.stats.cod.number",
    label: "about.stats.cod.label",
  },
  {
    id: 2,
    number: "about.stats.deliveryTime.number",
    label: "about.stats.deliveryTime.label",
  },
  {
    id: 3,
    number: "about.stats.languages.number",
    label: "about.stats.languages.label",
  },
  {
    id: 4,
    number: "about.stats.tracking.number",
    label: "about.stats.tracking.label",
  },
];

// Values Data
const values = [
  {
    id: 1,
    title: "about.values.quality.title",
    description: "about.values.quality.description",
    icon: Award,
  },
  {
    id: 2,
    title: "about.values.innovation.title",
    description: "about.values.innovation.description",
    icon: Zap,
  },
  {
    id: 3,
    title: "about.values.community.title",
    description: "about.values.community.description",
    icon: Users,
  },
  {
    id: 4,
    title: "about.values.sustainability.title",
    description: "about.values.sustainability.description",
    icon: Globe,
  },
];

// Hero Section
const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-2 bg-white/25 text-white rounded-full text-sm font-medium mb-4 backdrop-blur-md">
            {t("about.hero.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            {t("about.hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-8">
            {t("about.hero.subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
};

// Story Section
const StorySection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 mb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("about.story.title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
              {t("about.story.paragraph1")}
            </p>
            <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
              {t("about.story.paragraph2")}
            </p>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              {t("about.story.paragraph3")}
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=600&h=600&fit=crop"
              srcSet="https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=400&h=400&fit=crop 400w, https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=600&h=600&fit=crop 600w, https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=900&h=900&fit=crop 900w"
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt="A brown cardboard delivery box"
              loading="lazy"
              decoding="async"
              className="rounded-2xl shadow-sm w-full object-cover h-[400px]"
            />
            <div className="absolute -bottom-8 -left-8 rtl:left-auto rtl:-right-8 w-24 h-24 bg-primary/20 rounded-full" />
            <div className="absolute -top-4 -right-4 rtl:right-auto rtl:-left-4 w-32 h-32 bg-primary/10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-muted/50 rounded-2xl mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("about.stats.title")}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="text-center p-6 bg-card rounded-xl shadow-sm hover:shadow-sm transition-shadow border border-border"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {t(stat.number)}
              </div>
              <p className="text-muted-foreground font-medium">
                {t(stat.label)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Values Section
const ValuesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("about.values.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("about.values.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.id}
                className="hover:shadow-sm transition-all duration-150 hover:-translate-y-0.5 group p-6 bg-card rounded-xl border border-border hover:border-primary/50"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  {t(value.title)}
                </h3>
                <p className="text-muted-foreground">
                  {t(value.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Why Choose Us Section
const WhyChooseUsSection = () => {
  const { t } = useTranslation();

  const reasons = [
    {
      id: 1,
      title: "about.whyChooseUs.reason1.title",
      description: "about.whyChooseUs.reason1.description",
      icon: Truck,
    },
    {
      id: 2,
      title: "about.whyChooseUs.reason2.title",
      description: "about.whyChooseUs.reason2.description",
      icon: Shield,
    },
    {
      id: 3,
      title: "about.whyChooseUs.reason3.title",
      description: "about.whyChooseUs.reason3.description",
      icon: Banknote,
    },
    {
      id: 4,
      title: "about.whyChooseUs.reason4.title",
      description: "about.whyChooseUs.reason4.description",
      icon: MapPin,
    },
  ];

  return (
    <section className="py-16 md:py-24 mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("about.whyChooseUs.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("about.whyChooseUs.subtitle")}
          </p>
        </div>

        <div className="space-y-6">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.id}
                className="flex gap-6 items-start p-6 bg-muted/50 rounded-xl hover:bg-muted transition-colors border border-border hover:border-primary/50"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">
                    {t(reason.title)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(reason.description)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl mb-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t("about.cta.title")}
        </h2>
        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
          {t("about.cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {t("about.cta.button1")}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center bg-transparent text-primary-foreground border border-primary-foreground hover:bg-primary-foreground/10 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {t("about.cta.button2")}
          </Link>
        </div>
      </div>
    </section>
  );
};

// Main About Page Component
const AboutPage = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <HeroSection />
        <StorySection />
        <StatsSection />
        <ValuesSection />
        <WhyChooseUsSection />
        <CTASection />
      </div>
    </div>
  );
};

export default AboutPage;