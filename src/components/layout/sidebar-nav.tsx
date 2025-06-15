
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "react-router-dom";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: keyof typeof Icons;
    roles?: Array<"admin" | "cashier">; // If undefined, shown to all roles
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Add settings to admin navigation
  const enhancedItems = user?.role === "admin" ? [
    ...items,
    {
      href: "/admin/settings",
      title: "Settings",
      icon: "settings" as keyof typeof Icons,
      roles: ["admin" as const]
    }
  ] : items;

  const filteredItems = enhancedItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role as any)
  );

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {filteredItems.map((item) => {
        const Icon = Icons[item.icon];
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
