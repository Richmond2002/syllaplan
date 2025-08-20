
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getFirestore, collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { CreateLectureDialog } from './_components/create-lecture-dialog';
import { EditLectureDialog } from './_components/edit-lecture-dialog';
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
import { useToast } from '@/hooks/use-toast';

interface ScheduleEntry {
    day: string;
    startTime: string;
    endTime: string;
}

export interface Lecture {
    id: string;
    courseId: string;
    courseName: string;
    location: string;
    lecturerId: string;
    schedule: ScheduleEntry[];
}

export default function AdminSchedulePage() {
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
    
    const db = getFirestore(app);
    const { toast } = useToast();

    const fetchLectures = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "lectures"), orderBy("courseName", "asc"));
            const querySnapshot = await getDocs(q);
            const lecturesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Lecture[];
            setLectures(lecturesData);
        } catch (error) {
            console.error("Error fetching lectures:", error);
            toast({ title: "Error", description: "Failed to fetch schedule.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [db, toast]);

    useEffect(() => {
        fetchLectures();
    }, [fetchLectures]);

    const handleEdit = (lecture: Lecture) => {
        setSelectedLecture(lecture);
        setIsEditDialogOpen(true);
    };

    const openDeleteAlert = (lecture: Lecture) => {
        setLectureToDelete(lecture);
        setIsAlertOpen(true);
    };

    const handleDelete = async () => {
        if (!lectureToDelete) return;
        try {
            await deleteDoc(doc(db, "lectures", lectureToDelete.id));
            toast({
                title: "Success",
                description: `Lecture for "${lectureToDelete.courseName}" has been deleted.`,
            });
            fetchLectures(); // Refresh the list
        } catch (error) {
            console.error("Error deleting lecture:", error);
            toast({ title: "Error", description: "Failed to delete lecture.", variant: "destructive" });
        } finally {
            setIsAlertOpen(false);
            setLectureToDelete(null);
        }
    };
    
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(Number(hours), Number(minutes));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    const formatSchedule = (schedule: ScheduleEntry[]) => {
        if (!schedule || schedule.length === 0) return "Not scheduled";
        return schedule.map(s => `${s.day.substring(0,3)}: ${formatTime(s.startTime)} - ${formatTime(s.endTime)}`).join(', ');
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-3xl font-headline font-bold">Platform Schedule</h1>
                    <p className="text-muted-foreground">Manage the master recurring schedule for all courses.</p>
                </div>
                <CreateLectureDialog onLectureCreated={fetchLectures} />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Scheduled Lectures</CardTitle>
                    <CardDescription>A list of all recurring weekly lectures.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lectures.map((lecture) => (
                                    <TableRow key={lecture.id}>
                                        <TableCell className="font-medium">{lecture.courseName}</TableCell>
                                        <TableCell>{formatSchedule(lecture.schedule)}</TableCell>
                                        <TableCell>{lecture.location}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(lecture)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-destructive"
                                                        onClick={() => openDeleteAlert(lecture)}
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

            <EditLectureDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                lecture={selectedLecture}
                onLectureUpdated={fetchLectures}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the recurring lecture schedule for "{lectureToDelete?.courseName}". This action cannot be undone.
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
