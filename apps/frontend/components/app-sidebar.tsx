"use client";

import * as React from "react";
import { IconUsers, IconBook } from "@tabler/icons-react";

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
import { Logo } from "./navbar/logo";
import { useUser } from "@/hooks/use-user";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Books",
      url: "#",
      icon: IconBook,
    },
    {
      title: "Users",
      url: "#",
      icon: IconUsers,
    },
  ],
};

export function AppSidebar({ user }: { user: User | null }) {
 
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Logo className="size-16" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
