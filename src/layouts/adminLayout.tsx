import { AppSidebar } from "../components/admin/adminLayout/app-sidebar";
import { SiteHeader } from "../components/admin/adminLayout/site-header";
import { SidebarInset, SidebarProvider } from "../components/admin/adminLayout/sidebar";
import { Outlet } from "react-router-dom";

export default function Page() {
  return (

      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>

  );
}
