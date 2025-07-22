import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookMarked, Users } from "lucide-react";
import Link from "next/link";

const myCourses = [
  {
    title: "Advanced Algorithms",
    code: "CS203",
    lecturer: "Dr. Samuel Chen",
    description: "A deep dive into algorithmic design, analysis, and implementation.",
  },
  {
    title: "Quantum Physics 101",
    code: "PHY101",
    lecturer: "Dr. Evelyn Reed",
    description: "Exploring the strange and wonderful world of quantum mechanics.",
  },
  {
    title: "Human-Computer Interaction",
    code: "CS374",
    lecturer: "Dr. Kenji Tanaka",
    description: "Designing, evaluating, and implementing interactive computing systems.",
  },
  {
    title: "Renaissance Art History",
    code: "ARH300",
    lecturer: "Dr. Isabella Rossi",
    description: "A survey of painting, sculpture, and architecture from 14th to 16th century Italy.",
  },
];

export default function StudentCoursesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Courses</h1>
        <p className="text-muted-foreground">All your enrolled courses for the current semester.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {myCourses.map((course) => (
          <Card key={course.code} className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{course.title}</CardTitle>
                <CardDescription>{course.code}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">Taught by {course.lecturer}</p>
                <p className="text-sm text-foreground/80">{course.description}</p>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
                <Button className="w-full" asChild>
                    <Link href={`/student/courses/${course.code.toLowerCase()}`}>
                        <BookMarked className="mr-2 h-4 w-4" /> Go to Course
                    </Link>
                </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
