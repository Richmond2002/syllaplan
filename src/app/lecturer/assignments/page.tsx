import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CreateAssignmentDialog } from "./_components/create-assignment-dialog";

const assignments = [
    { id: "ASN001", title: "Problem Set 3", course: "Advanced Algorithms", dueDate: "2024-06-20", submissions: 98, status: "Grading" },
    { id: "ASN002", title: "Lab Report: Duality", course: "Quantum Physics 101", dueDate: "2024-06-22", submissions: 75, status: "Open" },
    { id: "ASN003", title: "Final Project Proposal", course: "HCI", dueDate: "2024-06-28", submissions: 0, status: "Open" },
    { id: "ASN004", title: "Essay: Renaissance vs. Baroque", course: "Art History", dueDate: "2024-06-15", submissions: 55, status: "Graded" },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Grading': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{status}</Badge>;
        case 'Open': return <Badge variant="secondary" className="bg-green-100 text-green-800">{status}</Badge>;
        case 'Graded': return <Badge variant="outline">{status}</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

export default function AssignmentsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Manage Assignments</h1>
                    <p className="text-muted-foreground">Create, distribute, and manage assignments for your courses.</p>
                </div>
                <CreateAssignmentDialog />
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                    <TableCell>{assignment.course}</TableCell>
                                    <TableCell>{assignment.dueDate}</TableCell>
                                    <TableCell>{assignment.submissions}</TableCell>
                                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
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
