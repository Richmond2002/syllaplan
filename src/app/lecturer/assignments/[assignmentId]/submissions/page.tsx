
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AssignmentDetails {
    title: string;
    course: string;
}

interface Submission {
    id: string;
    studentName: string;
    submittedAt: Timestamp;
    fileURL: string;
    grade?: string;
}

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.assignmentId as string;
    
    const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const db = getFirestore(app);
    const { toast } = useToast();

    const fetchSubmissions = useCallback(async () => {
        if (!assignmentId) return;
        setIsLoading(true);

        try {
            // Fetch assignment details
            const assignmentRef = doc(db, "assignments", assignmentId);
            const assignmentSnap = await getDoc(assignmentRef);

            if (!assignmentSnap.exists()) {
                toast({ title: "Error", description: "Assignment not found.", variant: "destructive" });
                router.push("/lecturer/assignments");
                return;
            }
            setAssignment(assignmentSnap.data() as AssignmentDetails);

            // Fetch submissions
            const submissionsQuery = query(collection(db, `assignments/${assignmentId}/submissions`), orderBy("submittedAt", "desc"));
            const submissionsSnapshot = await getDocs(submissionsQuery);
            const submissionsData = submissionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Submission[];
            setSubmissions(submissionsData);

        } catch (error) {
            console.error("Error fetching submissions:", error);
            toast({ title: "Error", description: "Failed to fetch submission data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [assignmentId, db, router, toast]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-headline font-bold">Student Submissions</h1>
                    <p className="text-muted-foreground">
                        {isLoading ? "Loading..." : `Viewing submissions for "${assignment?.title}" (${assignment?.course})`}
                    </p>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p>No submissions have been made for this assignment yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.studentName}</TableCell>
                                        <TableCell>{format(sub.submittedAt.toDate(), 'PPP p')}</TableCell>
                                        <TableCell>{sub.grade || "Not Graded"}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={sub.fileURL} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-3 w-3" />
                                                    Download
                                                </a>
                                            </Button>
                                            <Button size="sm" disabled={!!sub.grade}>
                                                Grade
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
