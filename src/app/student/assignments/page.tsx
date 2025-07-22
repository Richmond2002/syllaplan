
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFirestore, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { format, formatDistanceToNow } from 'date-fns';
import { Loader2 } from "lucide-react";

// Mock student's enrolled courses. In a real app, this would come from the student's profile.
const studentEnrolledCourses = ["CS203", "PHY101", "CS374", "ARH300"];

// Mock student's submissions. In a real app, this would be stored in the database.
const studentSubmissions: { [key: string]: { status: string } } = {
  // assignmentId: { status: 'Submitted' | 'Graded' | 'In Progress' }
};


interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: Timestamp;
  status: string; // This is the assignment's overall status (e.g., Open, Closed)
}

interface StudentAssignment extends Assignment {
  studentStatus: string; // The specific status for this student (e.g., Not Started, In Progress, Submitted)
}


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
    const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const db = getFirestore(app);

    const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        if (studentEnrolledCourses.length === 0) {
            setIsLoading(false);
            return;
        }

        try {
            const q = query(collection(db, "assignments"), where("course", "in", studentEnrolledCourses));
            const querySnapshot = await getDocs(q);
            const assignmentsData = querySnapshot.docs.map((doc) => {
                const data = doc.data() as Omit<Assignment, 'id'>;
                const studentStatus = studentSubmissions[doc.id]?.status || "Not Started";
                return {
                    id: doc.id,
                    ...data,
                    studentStatus,
                };
            }) as StudentAssignment[];

            // Sort by due date
            assignmentsData.sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis());

            setAssignments(assignmentsData);
        } catch (error) {
            console.error("Error fetching assignments: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">My Assignments</h1>
                <p className="text-muted-foreground">Keep track of your coursework and deadlines.</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                 {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                 ) : (
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
                                    <TableCell>
                                       {format(assignment.dueDate.toDate(), 'PPP')} ({formatDistanceToNow(assignment.dueDate.toDate(), { addSuffix: true })})
                                    </TableCell>
                                    <TableCell>{getStatusBadge(assignment.studentStatus)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant={assignment.studentStatus === 'Graded' ? 'outline' : 'default'}
                                            size="sm"
                                            disabled={assignment.studentStatus === 'Submitted'}
                                        >
                                            {assignment.studentStatus === 'Graded' ? 'View Grade' : 'View Assignment'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 )}
                </CardContent>
            </Card>
        </div>
    );
}

