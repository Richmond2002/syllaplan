
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateLecturerDialog } from "./_components/create-lecturer-dialog";
import { EditLecturerDialog } from "./_components/edit-lecturer-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
  courses: number;
  status: "Active" | "On Sabbatical" | "Inactive";
}

export default function LecturersPage() {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [lecturerToDeactivate, setLecturerToDeactivate] = useState<Lecturer | null>(null);

    const db = getFirestore(app);
    const { toast } = useToast();

    const fetchLecturers = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "lecturers"), orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const lecturersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Lecturer[];
            setLecturers(lecturersData);
        } catch (error) {
            console.error("Error fetching lecturers: ", error);
            toast({
                title: "Error",
                description: "Failed to fetch lecturers.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [db, toast]);

    useEffect(() => {
        fetchLecturers();
    }, [fetchLecturers]);

    const handleEdit = (lecturer: Lecturer) => {
        setSelectedLecturer(lecturer);
        setIsEditDialogOpen(true);
    };

    const handleDeactivate = async () => {
        if (!lecturerToDeactivate) return;
        
        try {
            const lecturerRef = doc(db, "lecturers", lecturerToDeactivate.id);
            await updateDoc(lecturerRef, { status: "Inactive" });
            toast({
                title: "Success",
                description: `${lecturerToDeactivate.name} has been deactivated.`,
            });
            fetchLecturers();
        } catch (error) {
             toast({
                title: "Error",
                description: "Failed to deactivate lecturer.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
            setLecturerToDeactivate(null);
        }
    };

    const openDeactivateAlert = (lecturer: Lecturer) => {
        setLecturerToDeactivate(lecturer);
        setIsAlertOpen(true);
    }

    const getStatusBadge = (status: Lecturer['status']) => {
        switch (status) {
            case 'Active':
                return <Badge variant="secondary" className="bg-green-100 text-green-800">{status}</Badge>;
            case 'On Sabbatical':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
            case 'Inactive':
                return <Badge variant="outline">{status}</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Manage Lecturers</h1>
                    <p className="text-muted-foreground">View, add, or edit lecturer profiles.</p>
                </div>
                <CreateLecturerDialog onLecturerCreated={fetchLecturers} />
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
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
                                    <TableCell className="font-medium">{lecturer.name}</TableCell>
                                    <TableCell>{lecturer.email}</TableCell>
                                    <TableCell>{lecturer.department}</TableCell>
                                    <TableCell>{lecturer.courses}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(lecturer.status)}
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
                                                <DropdownMenuItem onClick={() => handleEdit(lecturer)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-destructive"
                                                    onClick={() => openDeactivateAlert(lecturer)}
                                                    disabled={lecturer.status === 'Inactive'}
                                                >
                                                    Deactivate
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

            <EditLecturerDialog 
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                lecturer={selectedLecturer}
                onLecturerUpdated={fetchLecturers}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will mark {lecturerToDeactivate?.name} as inactive. They will lose access to their dashboard. This action can be reversed later.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeactivate}>Confirm Deactivation</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
