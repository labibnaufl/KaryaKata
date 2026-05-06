"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  Clock,
  AlertCircle,
  ArrowRight,
  ScrollText,
  TrendingUp,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { TrafficChart } from "./traffic-chart";
import { getAdminDashboardStats } from "../_lib/admin-actions";
import { getActionStyle } from "../_lib/dashboard-action-styles";

interface DashboardData {
  articles: {
    published: number;
    draft: number;
    archived: number;
    total: number;
  };
  users: {
    verified: number;
    pending: number;
    rejected: number;
    total: number;
  };
  recentLogs: Array<{
    id: string;
    action: string;
    details: string | null;
    createdAt: Date;
    userName: string;
  }>;
  pendingUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }>;
  trafficData: Array<{
    month: string;
    views: number;
  }>;
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const result = await getAdminDashboardStats();
      setData(result);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-muted rounded-2xl" />
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 pb-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Primary Metric: Articles */}
        <Link href="/admin/articles" className="group block">
          <div className="relative overflow-hidden rounded-2xl bg-card border  p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute inset-0 " />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-indigo-900">
                Artikel Diterbitkan
              </span>
            </div>
            <div className="relative z-10 flex items-baseline gap-3">
              <span className="text-4xl font-heading font-bold text-[##00f0f]">
                {data.articles.published}
              </span>
              <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                Artikel Lolos
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 2: Active Users */}
        <Link href="/admin/users" className="group block">
          <div className="relative overflow-hidden rounded-2xl bg-card border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute inset-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-emerald-900">
                User Aktif
              </span>
            </div>
            <div className="relative z-10 flex items-baseline gap-3">
              <span className="text-4xl font-heading font-bold text-emerald-950">
                {data.users.verified}
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                User Terverifikasi
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 3: Pending Users (Action Needed) */}
        <Link href="/admin/users?status=PENDING" className="group block">
          <div className="relative overflow-hidden rounded-2xl bg-card border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute inset-0" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-amber-900">
                User Pending
              </span>
            </div>
            <div className="relative z-10 flex items-baseline gap-3">
              <span className="text-4xl font-heading font-bold text-amber-950">
                {data.users.pending}
              </span>
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="size-3" /> Membutuhkan Persetujuan
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="col-span-2 rounded-2xl border bg-card p-6 shadow-sm h-[400px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-heading font-bold text-[#3f3f46]">
                Traffic Artikel
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pertumbuhan pengunjung 6 bulan terakhir
              </p>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <Activity className="size-5 text-muted-foreground" />
            </div>
          </div>
          <div className="h-[280px]">
            <TrafficChart data={data.trafficData} />
          </div>
        </div>

        {/* Pending Users Column */}
        <div className="rounded-2xl border bg-card shadow-sm flex flex-col h-full">
          <div className="p-5 border-b flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <h3 className="text-2xl font-heading font-bold text-[#3f3f46]">
                Pending User
              </h3>
            </div>
            {data.pendingUsers.length > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {data.pendingUsers.length} Baru
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {data.pendingUsers.length > 0 ? (
              <div className="divide-y">
                {data.pendingUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="p-5 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Users className="size-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pl-[52px]">
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </span>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-sm font-medium text-[#3f3f46]">
                  Semua bersih!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tidak ada user pending.
                </p>
              </div>
            )}
          </div>
          {data.pendingUsers.length > 5 && (
            <div className="p-3 border-t bg-muted/10 text-center">
              <Link
                href="/admin/users?status=PENDING"
                className="text-xs font-medium text-primary hover:underline flex items-center justify-center gap-1"
              >
                Lihat Semua ({data.pendingUsers.length}){" "}
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logs - Full Width */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <h3 className="text-2xl font-heading font-bold text-[#3f3f46]">
              Log Aktivitas Terbaru
            </h3>
          </div>
          <Link
            href="/admin/logs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Semua Log <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="divide-y">
          {data.recentLogs.length > 0 ? (
            data.recentLogs.map((log) => {
              const style = getActionStyle(log.action);
              return (
                <div
                  key={log.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="sm:w-48 shrink-0 flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${style.color} w-max`}
                    >
                      {style.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium pl-1">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {log.details ?? log.action}
                    </p>
                  </div>
                  <div className="sm:w-48 shrink-0 flex items-center gap-2 sm:justify-end">
                    <div className="size-6 rounded-full bg-muted flex items-center justify-center border">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {log.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                      {log.userName}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Activity className="size-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Belum ada aktivitas tercatat di sistem.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
