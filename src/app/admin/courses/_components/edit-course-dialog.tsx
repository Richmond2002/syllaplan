
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
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
import { getFirestore, doc, updateDoc, writeBatch, collection, getDocs, increment } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "../page";
import type { Lecturer } from "../../lecturers/page";
import { useEffect, useState, useCallback } from "react";

const courseSchema = z.object({
  code: z.string().min(1, "Course code is required."),
  title: z.string().min(1, "Course title is required."),
  department: z.string().min(1, "Department is required."),
  lecturerId: z.string().min(1, "Please assign a lecturer."),
});

interface EditCourseDialogProps {
  course: Course | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseUpdated: () => void;
}

export function EditCourseDialog({ course, isOpen, onOpenChange, onCourseUpdated }: EditCourseDialogProps) {
  const { toast } = useToast();
  const db = getFirestore(app);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);

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
    if (isOpen) {
      fetchLecturers();
    }
    if (course) {
      form.reset(course);
    }
  }, [course, isOpen, fetchLecturers, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    if (!course) return;

    try {
      const batch = writeBatch(db);
      const courseRef = doc(db, "courses", course.id);
      
      const selectedLecturer = lecturers.find(l => l.id === values.lecturerId);
      if (!selectedLecturer) {
        throw new Error("Selected lecturer not found.");
      }

      const updatedCourseData = {
        ...values,
        lecturerName: selectedLecturer.name,
      };
      batch.update(courseRef, updatedCourseData);

      // Handle lecturer course count change
      if (course.lecturerId !== values.lecturerId) {
        // Decrement old lecturer's course count
        const oldLecturerRef = doc(db, "lecturers", course.lecturerId);
        batch.update(oldLecturerRef, { courses: increment(-1) });
        // Increment new lecturer's course count
        const newLecturerRef = doc(db, "lecturers", values.lecturerId);
        batch.update(newLecturerRef, { courses: increment(1) });
      }

      await batch.commit();

      toast({
        title: "Success",
        description: "Course profile updated successfully.",
      });
      onCourseUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating course: ", error);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Course</DialogTitle>
          <DialogDescription>
            Update the details for {course?.title}.
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                   <Select onValueChange={field.onChange} value={field.value}>
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
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
