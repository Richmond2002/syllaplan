
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  UserCircle,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/admin/lecturers", icon: Users, label: "Lecturers", tooltip: "Lecturers" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses", tooltip: "Courses" },
  { href: "/admin/settings", icon: Settings, label: "Settings", tooltip: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/50 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Link href="/" className="flex items-center gap-2 font-bold">
               <svg
                className="size-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <h1 className="font-headline text-lg font-semibold">SyllaPlan</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
             <SidebarTrigger className="hidden md:flex" />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <UserCircle />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton tooltip={item.tooltip} asChild>
                      <Link href={item.href}>
                        <item.icon />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
