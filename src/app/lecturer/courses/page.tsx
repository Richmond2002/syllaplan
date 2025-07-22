import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, Users, BarChart } from "lucide-react";
import Link from "next/link";

const myCourses = [
  {
    title: "Advanced Algorithms",
    code: "CS203",
    description: "A deep dive into algorithmic design, analysis, and implementation.",
    students: 110,
  },
  {
    title: "Introduction to Artificial Intelligence",
    code: "CS401",
    description: "Fundamental concepts and techniques of artificial intelligence.",
    students: 95,
  },
  {
    title: "Database Systems",
    code: "CS340",
    description: "Principles of database design and management systems.",
    students: 120,
  },
  {
    title: "Human-Computer Interaction",
    code: "CS374",
    description: "Designing, evaluating, and implementing interactive computing systems.",
    students: 75,
  },
];

export default function MyCoursesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Courses</h1>
        <p className="text-muted-foreground">An overview of all courses you are teaching.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {myCourses.map((course) => (
          <Card key={course.code} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline text-2xl">{course.title}</CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.students} students</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-foreground/80">{course.description}</p>
            </CardContent>
            <div className="p-6 pt-0 mt-auto grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                    <Link href="/lecturer/syllabus-generator"><FileEdit className="mr-2 h-4 w-4" /> Edit Syllabus</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/lecturer/assignments"><BarChart className="mr-2 h-4 w-4" /> View Analytics</Link>
                </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
