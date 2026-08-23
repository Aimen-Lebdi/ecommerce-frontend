import { AppSidebar } from "../components/admin/adminLayout/app-sidebar";
import { SiteHeader } from "../components/admin/adminLayout/site-header";
import { SidebarInset, SidebarProvider } from "../components/admin/adminLayout/sidebar";
import { Outlet } from "react-router-dom";
import RouteFocus from "../components/RouteFocus";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation();

  return (

      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <RouteFocus />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('a11y.skipToContent')}
      </a>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <SiteHeader />
        <main id="main-content" className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>

  );
}
