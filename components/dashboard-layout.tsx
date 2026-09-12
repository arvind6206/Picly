"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  LogOut,
  LayoutDashboard,
  X,
  Menu,
  Loader2,
  Settings,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface User {
  name: string;
  email: string;
  role: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Events",
      href: "/dashboard/events",
      icon: Calendar,
    },
  ];

  const adminNavigation: NavItem[] = [
    {
      name: "Team Members",
      href: "/dashboard/team",
      icon: Users,
    },
  ];

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        router.push("/auth/login");
        return;
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push("/auth/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/auth/login");
      }
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Picly
              </h1>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-gray-100 text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {[...navigation, ...(user?.role === "ADMIN" ? adminNavigation : [])].map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-500"}`} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 p-4 bg-gradient-to-t from-gray-50 to-white">
            {user && (
              <Card className="mb-4 border-gray-200 bg-white shadow-sm">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                    {user.role}
                  </span>
                </div>
              </Card>
            )}

            <Button
              variant="outline"
              className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-gray-100 text-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find((item) => isActiveRoute(item.href))?.name || "Dashboard"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 relative text-gray-700"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 text-gray-700"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}