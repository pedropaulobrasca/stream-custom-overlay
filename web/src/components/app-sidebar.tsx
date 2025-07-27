import React from "react";
import {
  LayoutDashboard,
  List,
  TestTube,
  Shield,
  Coins,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SparklesText } from "./magicui/sparkles-text";
import { useAuth } from "@/contexts/AuthContext";

// Base navigation items that are always available
const baseNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Stream Actions",
    url: "/actions",
    icon: List,
  },
  {
    title: "Item Database",
    url: "/items",
    icon: Shield,
  },
  {
    title: "Market Tracker",
    url: "/market",
    icon: Coins,
  },
  {
    title: "Guild Tools",
    url: "/guild",
    icon: Users,
  },
];

// Additional navigation items that require actions to exist
const actionsRequiredNavItems = [
  {
    title: "Stream Overlays",
    url: "/overlays",
    icon: List,
  },
  {
    title: "Test Panel",
    url: "/test-panel",
    icon: TestTube,
  },
];

export const AppSidebar = React.memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // Create user data for NavUser component
  const userData = user ? {
    name: user.displayName || user.username,
    email: `@${user.username}`,
    avatar: user.profileImage,
  } : {
    name: "Loading...",
    email: "",
    avatar: "",
  };

  // Always show all navigation items for Albion Online tools
  const navItems = [...baseNavItems, ...actionsRequiredNavItems];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-16"
            >
              <a href="#">
                <SparklesText className="italic text-4xl">
                  Overaction
                </SparklesText>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
});
