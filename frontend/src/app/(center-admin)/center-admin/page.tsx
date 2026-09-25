"use client";

import DashboardHeader from "@/features/center-admin/components/dashboard/DashboardHeader";
import DashboardKpis from "@/features/center-admin/components/dashboard/DashboardKpis";
import RecentRequestsTable from "@/features/center-admin/components/dashboard/RecentRequestsTable";
import PriorityReviews from "@/features/center-admin/components/dashboard/PriorityReviews";
import ProfileStatusCard from "@/features/center-admin/components/dashboard/ProfileStatusCard";
import TodayScheduleCard from "@/features/center-admin/components/dashboard/TodayScheduleCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner Superior */}
      <DashboardHeader />

      {/* Tarjetas KPI */}
      <DashboardKpis />

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal (Solicitudes y Reseñas) */}
        <div className="lg:col-span-2 space-y-6">
          <RecentRequestsTable />
          <PriorityReviews />
        </div>

        {/* Columna Lateral (Estado y Horarios) */}
        <div className="space-y-6">
          <ProfileStatusCard />
          <TodayScheduleCard />
        </div>
      </div>
    </div>
  );
}