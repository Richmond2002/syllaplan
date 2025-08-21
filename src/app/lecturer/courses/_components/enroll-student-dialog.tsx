
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import type { Course } from "../page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateStudentLevel } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

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
  program: string;
  level: number;
}

function SearchResultsModal({ 
    isOpen, 
    onOpenChange, 
    students, 
    onEnroll,
    isEnrolling 
}: { 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void, 
    students: Student[], 
    onEnroll: (selectedStudents: Student[]) => void,
    isEnrolling: boolean
}) {
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

    const handleSelectStudent = (student: Student, checked: boolean) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, student]);
        } else {
            setSelectedStudents(prev => prev.filter(s => s.uid !== student.uid));
        }
    };
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(students);
        } else {
            setSelectedStudents([]);
        }
    }
    
    const isAllSelected = useMemo(() => students.length > 0 && selectedStudents.length === students.length, [students, selectedStudents]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-auto md:h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        Search Results – Found {students.length} Student(s)
                    </DialogTitle>
                    <DialogDescription>
                        Select the students you wish to enroll and click the enroll button.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow min-h-0">
                    <ScrollArea className="h-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Index Number</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Level</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.uid}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedStudents.some(s => s.uid === student.uid)}
                                                onCheckedChange={(checked) => handleSelectStudent(student, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.indexNumber}</TableCell>
                                        <TableCell>{student.program}</TableCell>
                                        <TableCell>{student.level}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                        onClick={() => onEnroll(selectedStudents)}
                        disabled={selectedStudents.length === 0 || isEnrolling}
                    >
                        {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enroll {selectedStudents.length} Selected
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
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
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const fetchEnrolledStudents = useCallback(async () => {
    if (!course) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, `courses/${course.id}/enrolledStudents`)
      );
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(
        (doc) => {
          const data = doc.data();
          return { 
            id: doc.id,
            ...data,
            level: calculateStudentLevel(data.indexNumber)
          } as Student;
        }
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
      
      const q = query(collection(db, "students"), ...conditions);
      const querySnapshot = await getDocs(q);
      
      const studentsData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Omit<Student, 'level' | 'program'> & { program?: string })
      );
      
      const enrolledStudentUids = new Set(enrolledStudents.map((s) => s.uid));
      let newStudents = studentsData.filter(s => !enrolledStudentUids.has(s.uid));

      if (searchCriteria.level) {
        const targetLevel = parseInt(searchCriteria.level);
        newStudents = newStudents.filter(student => calculateStudentLevel(student.indexNumber) === targetLevel);
      }

      const formattedStudents = newStudents.map(s => ({
          ...s, 
          program: s.program || s.indexNumber.split('/')[1],
          level: calculateStudentLevel(s.indexNumber)
      })) as Student[];

      setSearchResults(formattedStudents);
      setIsResultsModalOpen(true);

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

  const handleEnroll = async (studentsToEnroll: Student[]) => {
    if (!course || studentsToEnroll.length === 0) return;
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      
      studentsToEnroll.forEach((student) => {
        const enrollmentRef = doc(collection(db, `courses/${course.id}/enrolledStudents`));
        batch.set(enrollmentRef, {
            uid: student.uid,
            name: student.name,
            indexNumber: student.indexNumber,
            enrolledAt: serverTimestamp(),
        });
      });

      const courseRef = doc(db, "courses", course.id);
      batch.update(courseRef, { students: increment(studentsToEnroll.length) });

      await batch.commit();
      toast({
        title: "Success",
        description: `${studentsToEnroll.length} student(s) enrolled successfully.`,
      });
      // Close results modal and refresh main list
      setIsResultsModalOpen(false);
      fetchEnrolledStudents(); 
      onEnrollmentUpdated();
    } catch (error) {
        console.error("Error enrolling students:", error);
        toast({ title: "Error", description: "Failed to enroll students.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-auto md:h-[80vh] flex flex-col">
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
          {/* Left Side: Search Form */}
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

    <SearchResultsModal
        isOpen={isResultsModalOpen}
        onOpenChange={setIsResultsModalOpen}
        students={searchResults}
        onEnroll={handleEnroll}
        isEnrolling={isLoading}
    />
    </>
  );
}
