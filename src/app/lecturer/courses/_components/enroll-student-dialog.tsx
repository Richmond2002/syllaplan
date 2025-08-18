
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  increment,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import type { Course } from "../page";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnrollStudentDialogProps {
  course: Course | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrollmentUpdated: () => void;
}

interface Student {
  id: string;
  uid: string;
  name: string;
  indexNumber: string;
  level: number;
}

export function EnrollStudentDialog({
  course,
  isOpen,
  onOpenChange,
  onEnrollmentUpdated,
}: EnrollStudentDialogProps) {
  const { toast } = useToast();
  const db = getFirestore(app);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [searchCriteria, setSearchCriteria] = useState({
    department: "",
    program: "",
    level: "",
  });
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  const fetchEnrolledStudents = useCallback(async () => {
    if (!course) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, `courses/${course.id}/enrolledStudents`)
      );
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Student)
      );
      setEnrolledStudents(studentsData);
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      toast({
        title: "Error",
        description: "Could not fetch enrolled students.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [course, db, toast]);

  useEffect(() => {
    if (isOpen && course) {
      fetchEnrolledStudents();
      setSearchResults([]);
      setSearchCriteria({ department: "", program: "", level: "" });
    }
  }, [isOpen, course, fetchEnrolledStudents]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !searchCriteria.department &&
      !searchCriteria.program &&
      !searchCriteria.level
    ) {
      toast({
        title: "Search criteria needed",
        description: "Please provide at least one search filter.",
      });
      return;
    }
    setIsSearching(true);
    setSearchResults([]);

    try {
      let conditions = [];
      if (searchCriteria.department) {
        conditions.push(
          where("department", "==", searchCriteria.department.toUpperCase())
        );
      }
      if (searchCriteria.program) {
        conditions.push(
          where("program", "==", searchCriteria.program.toUpperCase())
        );
      }
      if (searchCriteria.level) {
        conditions.push(where("level", "==", parseInt(searchCriteria.level)));
      }

      const q = query(collection(db, "students"), ...conditions);
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Student)
      );

      const enrolledStudentUids = new Set(enrolledStudents.map((s) => s.uid));
      const newStudents = studentsData.filter(
        (s) => !enrolledStudentUids.has(s.uid)
      );

      setSearchResults(newStudents);

      if (newStudents.length === 0) {
        toast({
          title: "No new students found",
          description: "All matching students are already enrolled or none exist.",
        });
      }
    } catch (error) {
      console.error("Error searching for students:", error);
      toast({
        title: "Error",
        description: "An error occurred while searching.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnroll = async () => {
    if (!course || searchResults.length === 0) return;
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      
      searchResults.forEach((student) => {
        const enrollmentRef = doc(collection(db, `courses/${course.id}/enrolledStudents`));
        batch.set(enrollmentRef, {
            uid: student.uid,
            name: student.name,
            indexNumber: student.indexNumber,
            level: student.level,
            enrolledAt: serverTimestamp(),
        });
      });

      const courseRef = doc(db, "courses", course.id);
      batch.update(courseRef, { students: increment(searchResults.length) });

      await batch.commit();
      toast({
        title: "Success",
        description: `${searchResults.length} student(s) enrolled successfully.`,
      });
      onEnrollmentUpdated();
      onOpenChange(false);
    } catch (error) {
        console.error("Error enrolling students:", error);
        toast({ title: "Error", description: "Failed to enroll students.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Enroll Students in {course?.title}
          </DialogTitle>
          <DialogDescription>
            Search for students by department, program, or level and enroll them
            in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0">
          {/* Left Side: Search & Results */}
          <div className="flex flex-col gap-4">
            <form
              onSubmit={handleSearch}
              className="p-4 border rounded-lg space-y-4"
            >
              <h3 className="font-semibold">Find Students to Enroll</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g. PS"
                    value={searchCriteria.department}
                    onChange={(e) =>
                      setSearchCriteria({
                        ...searchCriteria,
                        department: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    placeholder="e.g. ITC"
                    value={searchCriteria.program}
                    onChange={(e) =>
                      setSearchCriteria({
                        ...searchCriteria,
                        program: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={searchCriteria.level}
                  onValueChange={(value) =>
                    setSearchCriteria({ ...searchCriteria, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Level 100</SelectItem>
                    <SelectItem value="200">Level 200</SelectItem>
                    <SelectItem value="300">Level 300</SelectItem>
                    <SelectItem value="400">Level 400</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Search Students
              </Button>
            </form>

            <div className="border rounded-lg flex-grow flex flex-col min-h-0">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Search Results</h3>
                <p className="text-sm text-muted-foreground">Found {searchResults.length} new student(s).</p>
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-4">
                    {searchResults.length > 0 ? (
                        <ul className="space-y-2">
                           {searchResults.map(student => (
                            <li key={student.uid} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-medium">{student.name}</p>
                                    <p className="text-muted-foreground">{student.indexNumber}</p>
                                </div>
                                <Badge variant="secondary">Level {student.level}</Badge>
                            </li>
                           ))}
                        </ul>
                    ) : (
                         <div className="text-center text-muted-foreground p-8">
                            <p>Search results will appear here.</p>
                        </div>
                    )}
                </div>
              </ScrollArea>
              {searchResults.length > 0 && (
                <div className="p-4 border-t">
                    <Button onClick={handleEnroll} className="w-full" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enroll {searchResults.length} Student(s)
                    </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Enrolled Students */}
          <div className="border rounded-lg flex flex-col min-h-0">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Currently Enrolled Students</h3>
                <p className="text-sm text-muted-foreground">{enrolledStudents.length} student(s) enrolled.</p>
            </div>
            <ScrollArea className="flex-grow">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Index Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.length > 0 ? (
                        enrolledStudents.map((student) => (
                        <TableRow key={student.uid}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.indexNumber}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                                No students enrolled yet.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
