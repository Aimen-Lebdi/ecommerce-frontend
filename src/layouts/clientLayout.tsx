import { Header } from '../components/client/clientLayout/Header';
import { Footer } from '../components/client/clientLayout/Footer';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import RouteFocus from '../components/RouteFocus';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { prefetchLikelyClientRoutes } from '../routes/prefetchRoutes';

const ClientLayout = () => {
  const { t } = useTranslation();

  // Warm the most-likely next page chunks while the browser is idle so the
  // first navigation feels instant (skipped for Save-Data / 2G users).
  useEffect(() => {
    prefetchLikelyClientRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      <RouteFocus />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('a11y.skipToContent')}
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet></Outlet>
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;