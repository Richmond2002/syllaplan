
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc, writeBatch, increment } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateCourseDialog } from "./_components/create-course-dialog";
import { EditCourseDialog } from "./_components/edit-course-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { logActivity } from "@/lib/firebase/log-activity";


export interface Course {
    id: string;
    code: string;
    title: string;
    lecturerName: string;
    lecturerId: string;
    students: number;
    department: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const db = getFirestore(app);
    const { toast } = useToast();

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "courses"), orderBy("title", "asc"));
            const querySnapshot = await getDocs(q);
            const coursesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Course[];
            setCourses(coursesData);
        } catch (error) {
            console.error("Error fetching courses: ", error);
            toast({
                title: "Error",
                description: "Failed to fetch courses.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [db, toast]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setIsEditDialogOpen(true);
    };

    const openDeleteAlert = (course: Course) => {
        setCourseToDelete(course);
        setIsAlertOpen(true);
    };

    const handleDelete = async () => {
        if (!courseToDelete) return;

        try {
            const batch = writeBatch(db);

            // 1. Delete the course
            const courseRef = doc(db, "courses", courseToDelete.id);
            batch.delete(courseRef);

            // 2. Decrement the lecturer's course count
            if (courseToDelete.lecturerId) {
                const lecturerRef = doc(db, "lecturers", courseToDelete.lecturerId);
                batch.update(lecturerRef, { courses: increment(-1) });
            }

            await batch.commit();
            await logActivity('Admin', 'deleted course', courseToDelete.title);
            
            toast({
                title: "Success",
                description: `Course "${courseToDelete.title}" has been deleted.`,
            });
            fetchCourses();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete course.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
            setCourseToDelete(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Manage Courses</h1>
                    <p className="text-muted-foreground">Oversee all courses on the platform.</p>
                </div>
                <CreateCourseDialog onCourseCreated={fetchCourses} />
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
                                <TableRow key={course.id}>
                                    <TableCell className="font-mono">{course.code}</TableCell>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>{course.lecturerName}</TableCell>
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
                                                <DropdownMenuItem onClick={() => handleEdit(course)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem 
                                                  className="text-destructive"
                                                  onClick={() => openDeleteAlert(course)}
                                                >
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

            <EditCourseDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                course={selectedCourse}
                onCourseUpdated={fetchCourses}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the course "{courseToDelete?.title}". This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Deletion</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
