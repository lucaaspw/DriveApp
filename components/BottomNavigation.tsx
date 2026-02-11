"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, BarChart3, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard", label: "Hoje", icon: Home },
  { href: "/registrar", label: "Registrar", icon: Plus },
  { href: "/financas", label: "Finanças", icon: Wallet },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "scale-110")} />
              <span className={cn("text-xs mt-1", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
