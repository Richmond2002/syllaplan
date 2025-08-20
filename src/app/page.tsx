import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, PenSquare, ClipboardCheck } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
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
            <span className="font-headline text-lg">CourseForge</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-14 pl-4">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary tracking-tight">
              Craft Brilliance, Teach with Ease
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
              CourseForge is your AI-powered partner for creating stunning syllabi, planning engaging lectures, and managing your courses effortlessly.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started for Free <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl font-bold">How CourseForge Empowers You</h2>
              <p className="text-muted-foreground mt-2">Go from idea to implementation in record time.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="w-10 h-10 text-primary" />}
                title="AI Syllabus Generator"
                description="Input your course title and objectives, and let our AI craft a comprehensive, professional syllabus in seconds."
              />
              <FeatureCard
                icon={<PenSquare className="w-10 h-10 text-primary" />}
                title="Dynamic Lecture Planner"
                description="Generate detailed, timed lecture plans with key topics, activities, and discussion points, tailored to your needs."
              />
              <FeatureCard
                icon={<ClipboardCheck className="w-10 h-10 text-primary" />}
                title="Unified Course Management"
                description="Keep all your courses, assignments, and schedules organized in one intuitive dashboard for easy access and control."
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-3xl font-bold">Focus on Teaching, Not Tedium</h2>
              <p className="mt-4 text-muted-foreground">
                CourseForge automates the repetitive administrative tasks of course creation, freeing you up to do what you do best: inspire students.
                From structuring content to setting deadlines, our intelligent tools provide a solid foundation, so you can focus on delivering exceptional learning experiences.
              </p>
              <Button asChild className="mt-6">
                <Link href="/lecturer">Explore the Lecturer Dashboard</Link>
              </Button>
            </div>
            <div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="A lecturer working on a laptop"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
                data-ai-hint="lecturer laptop"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background border-t">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} CourseForge. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
  return (
    <Card className="text-center p-6">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-headline text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}
