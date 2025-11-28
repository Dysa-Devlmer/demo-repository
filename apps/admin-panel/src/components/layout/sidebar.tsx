"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from '@/hooks/useTranslation';
import { X } from "lucide-react";
import {
  Bot,
  MessageSquare,
  MenuIcon,
  BarChart3,
  Settings,
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Brain,
  Shield,
  FileText,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSelector from "@/components/ui/language-selector";
import { Button } from "@/components/ui/button";

const navigationKeys = [
  { key: "dashboard", href: "/", icon: BarChart3 },
  { key: "conversations", href: "/conversations", icon: MessageSquare },
  { key: "orders", href: "/orders", icon: ShoppingBag },
  { key: "menu", href: "/menu", icon: MenuIcon },
  { key: "categories", href: "/categories", icon: Layers },
  { key: "customers", href: "/customers", icon: Users },
  { key: "reservations", href: "/reservations", icon: Calendar },
  { key: "analytics", href: "/analytics", icon: TrendingUp },
  { key: "reports", href: "/reports", icon: FileText },
  { key: "users", href: "/users", icon: Shield },
  { key: "aiChat", href: "/ai-chat", icon: Brain },
  { key: "settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-[220px] lg:w-[280px] border-r bg-muted/40 z-40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Bot className="h-6 w-6 text-dysa-purple" />
              <span className="text-dysa-purple">ChatBotDysa</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-2">
              {navigationKeys.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      isActive && "bg-muted text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{t(`navigation.${item.key}`)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen?.(false)} />
          <div className="fixed left-0 top-0 h-full w-72 border-r bg-background shadow-lg">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center justify-between border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Bot className="h-6 w-6 text-dysa-purple" />
                  <span className="text-dysa-purple">ChatBotDysa</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen?.(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start px-2 text-sm font-medium py-2">
                  {navigationKeys.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                          isActive && "bg-muted text-primary"
                        )}
                        onClick={() => setSidebarOpen?.(false)}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{t(`navigation.${item.key}`)}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="mt-auto p-4 border-t">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}