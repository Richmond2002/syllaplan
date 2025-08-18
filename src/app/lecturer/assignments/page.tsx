
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CreateAssignmentDialog } from "./_components/create-assignment-dialog";
import { getFirestore, collection, getDocs, query, orderBy, Timestamp, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  course: string;
  courseId: string;
  dueDate: Timestamp;
  submissions: number;
  status: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Grading":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {status}
        </Badge>
      );
    case "Open":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {status}
        </Badge>
      );
    case "Graded":
      return <Badge variant="outline">{status}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const fetchAssignments = useCallback(async (uid: string) => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "assignments"), 
        where("lecturerId", "==", uid), 
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const assignmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Assignment[];
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">
            Manage Assignments
          </h1>
          <p className="text-muted-foreground">
            Create, distribute, and manage assignments for your courses.
          </p>
        </div>
        <CreateAssignmentDialog onAssignmentCreated={() => auth.currentUser && fetchAssignments(auth.currentUser.uid)} />
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
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.title}
                    </TableCell>
                    <TableCell>{assignment.course}</TableCell>
                    <TableCell>
                      {format(assignment.dueDate.toDate(), 'PPP')}
                    </TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/lecturer/assignments/${assignment.id}/submissions`}>View Submissions</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
