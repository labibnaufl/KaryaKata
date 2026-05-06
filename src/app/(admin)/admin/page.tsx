import { DashboardClient } from "./_components/dashboard-client";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-[#000000]">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang di panel admin KaryaKata
        </p>
      </div>

      {/* Dashboard Content */}
      <DashboardClient />
    </div>
  );
}
