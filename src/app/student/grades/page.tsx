import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const grades = [
    { course: "Advanced Algorithms", category: "Assignment", title: "Problem Set 2", grade: "88%", letter: "B+" },
    { course: "Advanced Algorithms", category: "Assignment", title: "Problem Set 1", grade: "92%", letter: "A-" },
    { course: "Art History", category: "Exam", title: "Midterm Exam", grade: "91%", letter: "A-" },
    { course: "Art History", category: "Essay", title: "Renaissance vs. Baroque", grade: "95%", letter: "A" },
    { course: "Quantum Physics 101", category: "Quiz", title: "Week 4 Quiz", grade: "90%", letter: "A-" },
];

export default function StudentGradesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">My Grades</h1>
                    <p className="text-muted-foreground">A detailed overview of your academic performance.</p>
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="cs203">Advanced Algorithms</SelectItem>
                        <SelectItem value="arh300">Art History</SelectItem>
                        <SelectItem value="phy101">Quantum Physics 101</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grades.map((grade, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{grade.course}</TableCell>
                                    <TableCell>{grade.title}</TableCell>
                                    <TableCell>{grade.category}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-semibold">{grade.letter}</span>
                                        <span className="text-muted-foreground ml-2">({grade.grade})</span>
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
