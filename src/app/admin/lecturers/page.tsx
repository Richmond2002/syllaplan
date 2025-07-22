import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const lecturers = [
    { id: "LEC001", name: "Dr. Evelyn Reed", email: "e.reed@university.edu", department: "Physics", courses: 3, status: "Active" },
    { id: "LEC002", name: "Dr. Samuel Chen", email: "s.chen@university.edu", department: "Computer Science", courses: 4, status: "Active" },
    { id: "LEC003", name: "Dr. Isabella Rossi", email: "i.rossi@university.edu", department: "Art History", courses: 2, status: "On Sabbatical" },
    { id: "LEC004", name: "Dr. Kenji Tanaka", email: "k.tanaka@university.edu", department: "Engineering", courses: 5, status: "Active" },
];

export default function LecturersPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Manage Lecturers</h1>
                    <p className="text-muted-foreground">View, add, or edit lecturer profiles.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Lecturer
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Courses</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lecturers.map((lecturer) => (
                                <TableRow key={lecturer.id}>
                                    <TableCell className="font-mono">{lecturer.id}</TableCell>
                                    <TableCell className="font-medium">{lecturer.name}</TableCell>
                                    <TableCell>{lecturer.department}</TableCell>
                                    <TableCell>{lecturer.courses}</TableCell>
                                    <TableCell>
                                        <Badge variant={lecturer.status === 'Active' ? 'default' : 'outline'} className={lecturer.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                                            {lecturer.status}
                                        </Badge>
                                    </TableCell>
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
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
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
