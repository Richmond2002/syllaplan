
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc, runTransaction, getDoc, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import type { Lecturer } from "../../lecturers/page";
import { logActivity } from "@/lib/firebase/log-activity";

const courseSchema = z.object({
  code: z.string().min(1, "Course code is required."),
  title: z.string().min(1, "Course title is required."),
  department: z.string().min(1, "Department is required."),
  lecturerId: z.string().min(1, "Please assign a lecturer."),
});

export function CreateCourseDialog({ onCourseCreated }: { onCourseCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const { toast } = useToast();
  const db = getFirestore(app);

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: "",
      title: "",
      department: "",
      lecturerId: "",
    },
  });

  const fetchLecturers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lecturers"));
      const lecturersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lecturer[];
      setLecturers(lecturersData.filter(l => l.status === 'Active'));
    } catch (error) {
      console.error("Error fetching lecturers for dropdown: ", error);
    }
  }, [db]);

  useEffect(() => {
    if (open) {
      fetchLecturers();
    }
  }, [open, fetchLecturers]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    try {
        const selectedLecturer = lecturers.find(l => l.id === values.lecturerId);
        if (!selectedLecturer) {
            throw new Error("Selected lecturer not found.");
        }

        await runTransaction(db, async (transaction) => {
            const lecturerRef = doc(db, "lecturers", values.lecturerId);
            const lecturerDoc = await transaction.get(lecturerRef);

            if (!lecturerDoc.exists()) {
                throw "Lecturer document does not exist!";
            }

            const newCoursesCount = (lecturerDoc.data().courses || 0) + 1;
            transaction.update(lecturerRef, { courses: newCoursesCount });

            const courseRef = doc(collection(db, "courses"));
            transaction.set(courseRef, {
                ...values,
                lecturerName: selectedLecturer.name,
                students: 0,
                createdAt: serverTimestamp(),
            });
        });

        await logActivity('Admin', 'created a new course', values.title);

        toast({
            title: "Success",
            description: "Course created and assigned successfully.",
        });
        form.reset();
        onCourseCreated();
        setOpen(false);
    } catch (error) {
        console.error("Error creating course: ", error);
        toast({
            title: "Error",
            description: "Failed to create course. Please try again.",
            variant: "destructive",
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Course</DialogTitle>
          <DialogDescription>
            Enter the details for the new course.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Advanced Algorithms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CS203" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lecturerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Lecturer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an active lecturer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Course
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
