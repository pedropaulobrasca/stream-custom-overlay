import React from "react";
import {
  List,
  TestTube,
  Layers,
  DollarSign,
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
  // Stream group - core streaming functionality
  {
    title: "Stream",
    items: [
      {
        title: "Actions",
        url: "/actions",
        icon: List,
      },
      {
        title: "Overlays",
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
  // Tools group - Albion tools
  {
    title: "Tools",
    items: [
      {
        title: "Item Price",
        url: "/item-price",
        icon: DollarSign,
      },
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
