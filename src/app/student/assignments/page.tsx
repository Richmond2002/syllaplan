import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const assignments = [
    { id: "ASN001", title: "Problem Set 3", course: "Advanced Algorithms", dueDate: "in 2 days", status: "In Progress" },
    { id: "ASN002", title: "Lab Report: Duality", course: "Quantum Physics 101", dueDate: "in 4 days", status: "Not Started" },
    { id: "ASN003", title: "Final Project Proposal", course: "HCI", dueDate: "in 1 week", status: "Not Started" },
    { id: "ASN004", title: "Essay: Renaissance vs. Baroque", course: "Art History", dueDate: "1 day ago", status: "Submitted" },
    { id: "ASN005", title: "Problem Set 2", course: "Advanced Algorithms", dueDate: "1 week ago", status: "Graded" },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'In Progress': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case 'Not Started': return <Badge variant="destructive">{status}</Badge>;
        case 'Submitted': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{status}</Badge>;
        case 'Graded': return <Badge variant="secondary" className="bg-green-100 text-green-800">{status}</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

export default function StudentAssignmentsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">My Assignments</h1>
                <p className="text-muted-foreground">Keep track of your coursework and deadlines.</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Due</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                    <TableCell>{assignment.course}</TableCell>
                                    <TableCell>{assignment.dueDate}</TableCell>
                                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant={assignment.status === 'Graded' ? 'outline' : 'default'}
                                            size="sm"
                                            disabled={assignment.status === 'Submitted'}
                                        >
                                            {assignment.status === 'Graded' ? 'View Grade' : 'View Assignment'}
                                        </Button>
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
