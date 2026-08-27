"use client";

import * as React from "react";
import {
  IconLayoutDashboard,
  IconList,
  IconPackage,
  IconShoppingCart,
  IconUsers,
  IconBox,
  IconTag,
  IconHelp,
  IconHome,
} from "@tabler/icons-react";

import { NavMain } from "../../ui/nav-main";
import { NavSecondary } from "../../ui/nav-secondary";
import { NavUser } from "../../ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../admin/adminLayout/sidebar";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAppSelector } from "../../../app/hooks";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);

  const data = {
    navMain: [
      {
        title: t('sidebar.nav.dashboard'),
        url: "/admin",
        icon: IconLayoutDashboard,
      },
      {
        title: t('sidebar.nav.categories'),
        url: "/admin/categories",
        icon: IconList,
      },
      {
        title: t('sidebar.nav.subcategories'),
        url: "/admin/sub-categories",
        icon: IconBox,
      },
      {
        title: t('sidebar.nav.brands'),
        url: "/admin/brands",
        icon: IconTag,
      },
      {
        title: t('sidebar.nav.products'),
        url: "/admin/products",
        icon: IconPackage,
      },
      {
        title: t('sidebar.nav.orders'),
        url: "/admin/orders",
        icon: IconShoppingCart,
      },
      {
        title: t('sidebar.nav.users'),
        url: "/admin/users",
        icon: IconUsers,
      },
    ],
    navSecondary: [
      {
        title: t('sidebar.nav.backToStore'),
        url: "/",
        icon: IconHome,
      },
      {
        title: t('sidebar.nav.getHelp'),
        url: "/admin/help",
        icon: IconHelp,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/admin" className="flex items-center gap-2" aria-label={t("header.goHome")}>
                <img src="/logo.png" alt="" width={128} height={128} className="!size-5" />
                <img src="/shopName.png" alt="" width={130} height={64} className="h-7 w-auto" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}