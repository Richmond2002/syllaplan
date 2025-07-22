import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const courses = [
    { code: "PHY101", title: "Quantum Physics 101", lecturer: "Dr. Evelyn Reed", students: 85, department: "Physics" },
    { code: "CS203", title: "Advanced Algorithms", lecturer: "Dr. Samuel Chen", students: 110, department: "Computer Science" },
    { code: "ARH300", title: "Renaissance Art History", lecturer: "Dr. Isabella Rossi", students: 60, department: "Art History" },
    { code: "ENG404", title: "Mechanical Engineering Design", lecturer: "Dr. Kenji Tanaka", students: 95, department: "Engineering" },
];

export default function CoursesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Manage Courses</h1>
                    <p className="text-muted-foreground">Oversee all courses on the platform.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Course
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Lecturer</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.code}>
                                    <TableCell className="font-mono">{course.code}</TableCell>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>{course.lecturer}</TableCell>
                                    <TableCell>{course.students}</TableCell>
                                    <TableCell>{course.department}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
