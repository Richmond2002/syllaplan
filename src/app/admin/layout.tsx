
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  UserCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState } from "react";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  { href: "/admin/schedule", icon: Calendar, label: "Schedule", tooltip: "Schedule" },
  { href: "/admin/settings", icon: Settings, label: "Settings", tooltip: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = getAuth(app);
  const { toast } = useToast();
  const { loading } = useAuthGuard();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  useSessionTimeout();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/login");
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/50 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SidebarTrigger />
                <SheetContent side="left" className="p-0 pt-12 w-64">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Sidebar>
                        <SidebarContent onClick={handleLinkClick}>
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
                </SheetContent>
            </Sheet>

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
              <h1 className="font-headline text-lg font-semibold">CourseForge</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
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
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar className="hidden md:flex" />
          <div className="flex flex-1 flex-col overflow-y-auto">
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
