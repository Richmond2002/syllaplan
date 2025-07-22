
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  GraduationCap,
  PanelLeft,
  LogOut,
  Calendar,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";


const navItems = [
  { href: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/courses", icon: BookOpen, label: "My Courses" },
  { href: "/student/assignments", icon: ClipboardCheck, label: "Assignments" },
  { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes" },
  { href: "/student/grades", icon: GraduationCap, label: "Grades" },
  { href: "/student/schedule", icon: Calendar, label: "Schedule" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = getAuth(app);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/login");
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <svg
              className="size-8 text-primary"
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
            <h1 className="font-headline text-xl font-semibold">SyllaPlan</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    <item.icon />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut />
            Log out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 px-6 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Student Portal</h2>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
