"use client"

import * as React from "react"
import {
  LayoutDashboard,
  List,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  TagIcon,
} from "lucide-react";
import {
  IconHelp,
  IconInnerShadowTop,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "../../ui/nav-main"
import { NavSecondary } from "../../ui/nav-secondary"
import { NavUser } from "../../ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../admin/adminLayout/sidebar"
import { Link } from "react-router-dom"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain :[
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: List, 
  },
  {
    title: "SubCategories",
    url: "/admin/sub-categories",
    icon: Boxes, 
  },
  {
    title: "Brands",
    url: "/admin/brands",
    icon: TagIcon, 
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },

],
navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/admin">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
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
  )
}
