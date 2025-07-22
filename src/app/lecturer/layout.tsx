
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ScrollText,
  PenSquare,
  Calendar,
  ClipboardList,
  BookCopy,
  PanelLeft,
  LogOut,
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

const navItems = [
  { href: "/lecturer", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/lecturer/courses", icon: BookCopy, label: "My Courses" },
  { href: "/lecturer/syllabus-generator", icon: ScrollText, label: "Syllabus Generator" },
  { href: "/lecturer/lecture-planner", icon: PenSquare, label: "Lecture Planner" },
  { href: "/lecturer/schedule", icon: Calendar, label: "Schedule" },
  { href: "/lecturer/assignments", icon: ClipboardList, label: "Assignments" },
];

export default function LecturerLayout({
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
            <h1 className="font-headline text-xl font-semibold">CourseForge</h1>
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
            <h2 className="text-lg font-semibold">Lecturer Panel</h2>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
