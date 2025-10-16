"use client";

import * as React from "react";
import {
  LayoutDashboard,
  List,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  TagIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { IconHelp, IconInnerShadowTop } from "@tabler/icons-react";

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t('sidebar.nav.dashboard'),
        url: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: t('sidebar.nav.categories'),
        url: "/admin/categories",
        icon: List,
      },
      {
        title: t('sidebar.nav.subcategories'),
        url: "/admin/sub-categories",
        icon: Boxes,
      },
      {
        title: t('sidebar.nav.brands'),
        url: "/admin/brands",
        icon: TagIcon,
      },
      {
        title: t('sidebar.nav.products'),
        url: "/admin/products",
        icon: Package,
      },
      {
        title: t('sidebar.nav.orders'),
        url: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: t('sidebar.nav.users'),
        url: "/admin/users",
        icon: Users,
      },
    ],
    navSecondary: [
      {
        title: t('sidebar.nav.backToStore'),
        url: "/",
        icon: ShoppingCartIcon,
      },
      {
        title: t('sidebar.nav.getHelp'),
        url: "#",
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
              <Link to="/admin" className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{t('sidebar.companyName')}</span>
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}