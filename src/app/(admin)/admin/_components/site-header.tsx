"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function getPageTitle(pathname: string): { title: string; parent?: { title: string; href: string } } {
  // Remove /admin prefix and split
  const path = pathname.replace("/admin", "").split("/").filter(Boolean);
  
  if (path.length === 0) return { title: "Dashboard" };
  
  const section = path[0];
  
  switch (section) {
    case "articles":
      if (path[1] === "new") return { title: "Tulis Artikel", parent: { title: "Artikel", href: "/admin/articles" } };
      if (path[1]) return { title: "Edit Artikel", parent: { title: "Artikel", href: "/admin/articles" } };
      return { title: "Kelola Artikel" };
    case "users":
      if (path[1]) return { title: "Edit Pengguna", parent: { title: "Pengguna", href: "/admin/users" } };
      return { title: "Kelola Pengguna" };
    case "logs":
      return { title: "Admin Logs" };
    default:
      return { title: "Dashboard" };
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const { title, parent } = getPageTitle(pathname);
  
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4!" />
      <Breadcrumb>
        <BreadcrumbList>
          {parent && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={parent.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  {parent.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-medium">
              {title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
