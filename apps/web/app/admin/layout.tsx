'use client';

import { useState } from "react";
import { Flame, LayoutGrid, MapPin, Menu, Ticket } from "lucide-react";
import Sidebar, { defaultSidebarConfig, SidebarNavigationItem } from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const adminNavigation: SidebarNavigationItem[] = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutGrid size={20} strokeWidth={2.5} />, href: "/admin", isActive: pathname === "/admin" },
    { id: "track", name: "Your Tickets", icon: <Ticket size={20} strokeWidth={2} />, href: "/admin/tickets", isActive: pathname === "/admin/tickets" },
    { id: "projects", name: "Heatmap", icon: <Flame size={20} strokeWidth={2} />, href: "/admin/heatmap", isActive: pathname === "/admin/heatmap" },
    { id: "reports", name: "Nearby Tickets", icon: <MapPin size={20} strokeWidth={2} />, href: "/admin/reports", isActive: pathname === "/admin/reports" },
  ];

  const sidebarConfig = {
    ...defaultSidebarConfig,
    branding: {
      ...defaultSidebarConfig.branding,
      title: "Admin",
    },
    colors: {
      ...defaultSidebarConfig.colors,
      textMain: "text-white dark:text-white",
    },
    navigation: adminNavigation,
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        {...sidebarConfig} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />


      {/* Keep content adjacent to fixed sidebar on desktop */}
      <main className={`flex-1 w-full p-4 transition-[margin] duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 bg-purple-600 text-white rounded-md mb-4"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        {children}
      </main>
    </div>
  );
}