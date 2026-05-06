"use client";

import * as React from "react";
import {
  FileText,
  LayoutDashboard,
  Users,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
];

const contentNav: NavItem[] = [
  { title: "Artikel", url: "/admin/articles", icon: Newspaper },
];

const adminNavItems: NavItem[] = [
  { title: "Pengguna", url: "/admin/users", icon: Users },
  { title: "Admin Log", url: "/admin/logs", icon: FileText },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="px-2">
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-2">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isActive =
            item.url === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className="h-12 px-4 text-base gap-3 text-[#3f3f46] rounded-lg"
              >
                <Link href={item.url}>
                  <item.icon className="size-5 shrink-0 text-[#3f3f46]" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
}) {
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const userData = {
    name: user.name,
    email: user.email,
    avatar: user.image || "",
    role: user.role,
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-auto py-5 hover:bg-transparent active:bg-transparent"
            >
              <Link
                href="/admin"
                className="flex flex-col items-center justify-center gap-2 group-data-[collapsible=icon]:flex-row"
              >
                <div className="flex aspect-square size-12 shrink-0 items-center justify-center rounded-xl bg-[#05D9FF] text-black font-heading font-bold text-sm shadow-md">
                  K.
                </div>
                <div className="flex flex-col items-center text-center group-data-[collapsible=icon]:hidden">
                  <span className="font-heading font-bold text-base text-black leading-tight">
                    Karya Kata.
                  </span>
                  <span className="text-xs text-muted-foreground tracking-wide">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mx-3 my-2 h-px bg-border/60 group-data-[collapsible=icon]:mx-2" />
      </SidebarHeader>

      <SidebarContent className="gap-4 pt-2 ">
        <NavGroup label="Menu Utama" items={mainNav} />
        <NavGroup label="Konten" items={contentNav} />
        {isAdmin && <NavGroup label="Administrasi" items={adminNavItems} />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}