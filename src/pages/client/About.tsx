import { useTranslation } from "react-i18next";
import {
  Users,
  Globe,
  Zap,
  Award,
  Heart,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

// Team Members Data
const teamMembers = [
  {
    id: 1,
    name: "about.team.members.member1.name",
    role: "about.team.members.member1.role",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    bio: "about.team.members.member1.bio",
  },
  {
    id: 2,
    name: "about.team.members.member2.name",
    role: "about.team.members.member2.role",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "about.team.members.member2.bio",
  },
  {
    id: 3,
    name: "about.team.members.member3.name",
    role: "about.team.members.member3.role",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
    bio: "about.team.members.member3.bio",
  },
  {
    id: 4,
    name: "about.team.members.member4.name",
    role: "about.team.members.member4.role",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
    bio: "about.team.members.member4.bio",
  },
];

// Stats Data
const stats = [
  {
    id: 1,
    number: "about.stats.customers.number",
    label: "about.stats.customers.label",
  },
  {
    id: 2,
    number: "about.stats.products.number",
    label: "about.stats.products.label",
  },
  {
    id: 3,
    number: "about.stats.orders.number",
    label: "about.stats.orders.label",
  },
  {
    id: 4,
    number: "about.stats.countries.number",
    label: "about.stats.countries.label",
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
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary via-primary/50 to-purple-600 dark:from-primary dark:via-purple-700 dark:to-blue-900 rounded-2xl mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-2 bg-white/25 dark:bg-white/35 text-white rounded-full text-sm font-medium mb-4 backdrop-blur-md">
            {t("about.hero.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            {t("about.hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/95 dark:text-white mb-8">
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
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
              {t("about.story.cta")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&h=600&fit=crop"
              alt="Our Story"
              className="rounded-2xl shadow-2xl w-full object-cover h-[400px]"
            />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full opacity-60" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500 to-primary rounded-full opacity-40" />
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
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-2xl mb-16">
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
              className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary dark:text-blue-400 mb-2">
                {t(stat.number)}
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
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
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-blue-400"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                  <Icon className="h-6 w-6 text-primary dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-slate-900 dark:text-white">
                  {t(value.title)}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
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
      icon: RotateCcw,
    },
    {
      id: 4,
      title: "about.whyChooseUs.reason4.title",
      description: "about.whyChooseUs.reason4.description",
      icon: Heart,
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
                className="flex gap-6 items-start p-6 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-blue-400"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                    {t(reason.title)}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
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

// Team Section
const TeamSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("about.team.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("about.team.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="text-center group hover:shadow-lg p-6 rounded-xl transition-all duration-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-blue-400"
            >
              <div className="mb-4 overflow-hidden rounded-xl">
                <img
                  src={member.image}
                  alt={t(member.name)}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-slate-900 dark:text-white">
                {t(member.name)}
              </h3>
              <p className="text-primary dark:text-blue-400 font-medium mb-2">
                {t(member.role)}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t(member.bio)}
              </p>
            </div>
          ))}
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
          <button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-3 rounded-lg font-medium transition-colors">
            <Link to="/shop">
            {t("about.cta.button1")}
            </Link>
          </button>
          <button className="bg-transparent text-primary-foreground border border-primary-foreground hover:bg-primary-foreground/10 px-8 py-3 rounded-lg font-medium transition-colors">
            <Link to="/my-account?tab=support">
            {t("about.cta.button2")}
            </Link>
          </button>
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
        <TeamSection />
        <CTASection />
      </div>
    </div>
  );
};

export default AboutPage;