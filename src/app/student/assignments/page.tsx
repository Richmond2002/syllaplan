
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFirestore, collection, getDocs, query, where, Timestamp, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { format, formatDistanceToNow } from 'date-fns';
import { Loader2 } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";


// Fetches the course IDs a student is enrolled in.
const getStudentEnrolledCourseIds = async (db: any, studentUid: string): Promise<string[]> => {
    const enrolledCourses: string[] = [];
    const coursesRef = collection(db, "courses");
    const coursesSnapshot = await getDocs(coursesRef);

    for (const courseDoc of coursesSnapshot.docs) {
        const enrollmentDocRef = doc(db, `courses/${courseDoc.id}/enrolledStudents`, studentUid);
        const enrollmentDoc = await getDoc(enrollmentDocRef);
        if (enrollmentDoc.exists()) {
            enrolledCourses.push(courseDoc.id);
        }
    }
    return enrolledCourses;
};


const studentSubmissions: { [key: string]: { status: string } } = {
  // Mock data, e.g., assignmentId: { status: 'Submitted' }
};

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: Timestamp;
  status: string;
}

interface StudentAssignment extends Assignment {
  studentStatus: string;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'In Progress': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">{status}</Badge>;
        case 'Not Started': return <Badge variant="destructive">{status}</Badge>;
        case 'Submitted': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{status}</Badge>;
        case 'Graded': return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{status}</Badge>;
        default: return <Badge>{status}</Badge>;
    }
};

export default function StudentAssignmentsPage() {
    const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const fetchAssignments = useCallback(async (uid: string) => {
        setIsLoading(true);
        // Find student document to get their UID for enrollment checks
        const studentQuery = query(collection(db, "students"), where("uid", "==", uid));
        const studentSnapshot = await getDocs(studentQuery);
        
        if (studentSnapshot.empty) {
            console.log("No student profile found for current user.");
            setIsLoading(false);
            return;
        }

        const studentDoc = studentSnapshot.docs[0];
        const studentId = studentDoc.id; // This is the doc ID, not the UID.

        const enrolledCourseIds: string[] = [];
        const coursesQuerySnapshot = await getDocs(collection(db, "courses"));
        for (const courseDoc of coursesQuerySnapshot.docs) {
            const enrollmentQuery = query(collection(db, `courses/${courseDoc.id}/enrolledStudents`), where("uid", "==", uid));
            const enrollmentSnapshot = await getDocs(enrollmentQuery);
            if (!enrollmentSnapshot.empty) {
                enrolledCourseIds.push(courseDoc.id);
            }
        }
        
        if (enrolledCourseIds.length === 0) {
            setIsLoading(false);
            setAssignments([]);
            return;
        }

        try {
            const q = query(collection(db, "assignments"), where("courseId", "in", enrolledCourseIds));
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

            assignmentsData.sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis());
            setAssignments(assignmentsData);
        } catch (error) {
            console.error("Error fetching assignments: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchAssignments(user.uid);
            } else {
                setIsLoading(false);
                setAssignments([]);
            }
       });
       return () => unsubscribe();
    }, [auth, fetchAssignments]);

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
                 ) : assignments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-20">
                        <p className="font-semibold">No assignments found.</p>
                        <p>You have no assignments from your enrolled courses yet.</p>
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
