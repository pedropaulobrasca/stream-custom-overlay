import React from "react";
import {
  LayoutDashboard,
  List,
  TestTube,
  Layers,
  Wrench,
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

// Navigation groups organized by functionality
const navigationGroups = [
  // Dashboard - standalone at the top
  {
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  // Overlay group - core streaming functionality
  {
    title: "Overlay",
    items: [
      {
        title: "Stream Actions",
        url: "/actions",
        icon: List,
      },
      {
        title: "Stream Overlays",
        url: "/overlays",
        icon: Layers,
      },
      {
        title: "Test Panel",
        url: "/test-panel",
        icon: TestTube,
      },
    ],
  },
  // Tools group - future Albion tools
  {
    title: "Tools",
    items: [
      {
        title: "Coming Soon",
        url: "#",
        icon: Wrench,
      },
      // Future Albion tools will be added here:
      // {
      //   title: "Market Tracker",
      //   url: "/tools/market",
      //   icon: TrendingUp,
      // },
      // {
      //   title: "Guild Tools",
      //   url: "/tools/guild",
      //   icon: Users,
      // },
    ],
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

  // Show all navigation groups
  const visibleGroups = navigationGroups;

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
        <NavMain groups={visibleGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
});
