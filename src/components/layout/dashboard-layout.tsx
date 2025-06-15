
import { useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { DashboardSidebar } from "./DashboardSidebar";
import { ProfileDropdown } from "./ProfileDropdown";
import { AddCashierDialog } from "./AddCashierDialog";
import React, { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  // Dialog open state
  const [showAddDialog, setShowAddDialog] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Inventory Management",
      href: "/admin/inventory",
      icon: "inventory",
      roles: ["admin"],
    },
    {
      title: "Sales Analysis",
      href: "/admin/sales",
      icon: "sales",
      roles: ["admin"],
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: "reports",
      roles: ["admin"],
    },
    {
      title: "Point of Sale",
      href: "/cashier/pos",
      icon: "cart",
    },
    {
      title: "Sales History",
      href: "/cashier/history",
      icon: "history",
    },
  ];

  return (
    <SidebarProvider>
      {/* Add Cashier Dialog for admin only */}
      {user?.role === "admin" && (
        <AddCashierDialog open={showAddDialog} setOpen={setShowAddDialog} />
      )}
      <div className="min-h-screen flex w-full">
        <DashboardSidebar navItems={navItems} />
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between border-b bg-background p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title="Notifications">
                <Icons.bell className="h-5 w-5" />
              </Button>
              <ProfileDropdown onAddCashier={() => setShowAddDialog(true)} />
            </div>
          </div>
          <main className="container p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
