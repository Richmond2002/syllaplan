
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  GraduationCap,
  Calendar,
  UserCircle,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
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
  { href: "/student", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/student/courses", icon: BookOpen, label: "My Courses", tooltip: "My Courses" },
  { href: "/student/assignments", icon: ClipboardCheck, label: "Assignments", tooltip: "Assignments" },
  { href: "/student/quizzes", icon: HelpCircle, label: "Quizzes", tooltip: "Quizzes" },
  { href: "/student/grades", icon: GraduationCap, label: "Grades", tooltip: "Grades" },
  { href: "/student/schedule", icon: Calendar, label: "Schedule", tooltip: "Schedule" },
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
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/50 px-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
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
                        <DropdownMenuItem asChild>
                        <Link href="/student/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <Sidebar>
                    <SidebarContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton tooltip={item.tooltip} asChild>
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <div className="relative flex flex-1 flex-col overflow-auto">
                    <SidebarTrigger className="md:hidden" />
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </div>
    </SidebarProvider>
  );
}
