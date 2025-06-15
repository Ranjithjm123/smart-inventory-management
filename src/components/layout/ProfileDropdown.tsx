
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { CashierCount } from "./CashierCount";

interface ProfileDropdownProps {
  onAddCashier: () => void;
}

export function ProfileDropdown({ onAddCashier }: ProfileDropdownProps) {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/60 transition-shadow hover:ring-4 duration-200">
          <AvatarFallback>
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-lg shadow-xl p-0 bg-popover z-50 border"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-lg px-4 py-3 mb-0 font-semibold rounded-t-lg bg-muted/50">
          Profile
        </DropdownMenuLabel>
        <div className="px-4 py-3 flex flex-col items-start gap-2">
          <div className="font-medium text-base leading-tight">{user?.name}</div>
          <div className="text-xs text-muted-foreground break-all">{user?.email}</div>
          <div className="text-xs capitalize">{user?.role}</div>
          {/* CashierCount button */}
          {user?.role === "admin" && (
            <div className="mt-1">
              <CashierCount />
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="my-1" />
        {/* Add User as Add Cashier (admin only) */}
        {user?.role === "admin" && (
          <>
            <DropdownMenuItem
              onClick={onAddCashier}
              className="flex items-center gap-2 rounded px-4 py-2 text-sm cursor-pointer hover:bg-accent/80 transition-colors"
            >
              <Icons.add className="h-4 w-4 text-primary" />
              <span>Add User</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
          </>
        )}
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 rounded px-4 py-2 text-sm cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <Icons.logout className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
