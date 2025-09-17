"use client";

import { useState } from "react";
import AppNavbar from "@/app/layout/dashboard/NavBar";
import Sidebar from "@/app/layout/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <AppNavbar
        isCollapsed={isCollapsed}
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-row">
        {/* Sidebar */}
        <Sidebar isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
