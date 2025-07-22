import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, UserCog } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary tracking-tight">
          CourseForge
        </h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          AI-Powered Syllabus & Lecture Planning. <br /> Streamline your course creation from start to finish.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <RoleCard
          href="/admin"
          icon={<UserCog className="w-10 h-10 mb-4 text-primary" />}
          title="Admin"
          description="Manage lecturers, courses, and platform-wide settings to keep everything running smoothly."
        />
        <RoleCard
          href="/lecturer"
          icon={<BookOpen className="w-10 h-10 mb-4 text-primary" />}
          title="Lecturer"
          description="Generate syllabi, plan lectures, manage assignments, and organize your course schedule effortlessly."
        />
        <RoleCard
          href="/student"
          icon={<GraduationCap className="w-10 h-10 mb-4 text-primary" />}
          title="Student"
          description="Access your courses, view lecture materials, submit assignments, and track your academic progress."
        />
      </div>

      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} CourseForge. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

function RoleCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string; }) {
  return (
    <Card className="transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl flex flex-col">
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col text-center">
        <CardDescription className="flex-grow">{description}</CardDescription>
        <Button asChild className="mt-6 w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={href}>
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
