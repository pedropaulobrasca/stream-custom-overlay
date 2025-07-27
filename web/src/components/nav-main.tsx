import React from "react";
import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavGroup {
  title?: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}

export const NavMain = React.memo(function NavMain({
  groups,
}: {
  groups: NavGroup[];
}) {
  const location = useLocation();

  return (
    <>
      {groups.map((group, groupIndex) => (
        <SidebarGroup key={groupIndex}>
          <SidebarGroupContent className="flex flex-col gap-2">
            {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = location.pathname === item.url ||
                  (location.pathname === "/" && item.url === "/dashboard");

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="cursor-pointer"
                      asChild
                      isActive={isActive}
                    >
                      <Link to={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
});
