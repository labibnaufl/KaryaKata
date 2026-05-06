"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { SiteHeader } from "./site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

function AdminSkeleton() {
  return (
    <div className="flex h-screen w-full">
      <div className="w-72 bg-muted animate-pulse" />
      <div className="flex-1 p-6">
        <div className="h-12 bg-muted rounded-lg animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <AdminSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    return null;
  }

  const user = {
    id: session.user.id || "",
    name: session.user.name || "Admin",
    email: session.user.email || "",
    image: session.user.image || "",
    role: session.user.role,
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AdminSidebar user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
