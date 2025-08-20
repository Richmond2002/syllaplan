
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFirestore, doc, updateDoc, Timestamp, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Course } from "../../courses/page";
import type { Lecture } from "../page";

const lectureSchema = z.object({
  courseId: z.string().min(1, "Please select a course."),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  location: z.string().min(1, "Location is required (e.g., 'Room 101' or 'Online')."),
}).refine(data => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

interface EditLectureDialogProps {
  lecture: Lecture | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLectureUpdated: () => void;
}

export function EditLectureDialog({ lecture, isOpen, onOpenChange, onLectureUpdated }: EditLectureDialogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const { toast } = useToast();
  const db = getFirestore(app);

  const form = useForm<z.infer<typeof lectureSchema>>({
    resolver: zodResolver(lectureSchema),
  });

  const fetchCourses = useCallback(async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Course[];
        setCourses(coursesData);
    } catch (error) {
        console.error("Error fetching courses for dropdown: ", error);
    }
  }, [db]);

  useEffect(() => {
    if (isOpen) {
        fetchCourses();
    }
    if (lecture) {
        const startTimeDate = lecture.startTime.toDate();
        const endTimeDate = lecture.endTime ? lecture.endTime.toDate() : startTimeDate;
        form.reset({
            courseId: lecture.courseId,
            date: startTimeDate,
            startTime: format(startTimeDate, "HH:mm"),
            endTime: format(endTimeDate, "HH:mm"),
            location: lecture.location,
        });
    }
  }, [lecture, isOpen, fetchCourses, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof lectureSchema>) => {
    if (!lecture) return;
    
    const selectedCourse = courses.find(c => c.id === values.courseId);
    if (!selectedCourse) {
        toast({ title: "Error", description: "Selected course not found.", variant: "destructive" });
        return;
    }

    try {
      const [startHours, startMinutes] = values.startTime.split(':').map(Number);
      const newStartTime = new Date(values.date);
      newStartTime.setHours(startHours, startMinutes, 0, 0);

      const [endHours, endMinutes] = values.endTime.split(':').map(Number);
      const newEndTime = new Date(values.date);
      newEndTime.setHours(endHours, endMinutes, 0, 0);

      const lectureRef = doc(db, "lectures", lecture.id);
      await updateDoc(lectureRef, {
        courseId: values.courseId,
        courseName: `${selectedCourse.title} (${selectedCourse.code})`,
        startTime: Timestamp.fromDate(newStartTime),
        endTime: Timestamp.fromDate(newEndTime),
        location: values.location,
        lecturerId: selectedCourse.lecturerId,
      });

      toast({
        title: "Success",
        description: "Lecture updated successfully.",
      });
      onLectureUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating lecture: ", error);
      toast({
        title: "Error",
        description: "Failed to update lecture. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Edit Lecture
          </DialogTitle>
          <DialogDescription>
            Update the details for this lecture.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>{course.title} ({course.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                  <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                      <PopoverTrigger asChild>
                      <FormControl>
                          <Button
                          variant={"outline"}
                          className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                          )}
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                      </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                      />
                      </PopoverContent>
                  </Popover>
                  <FormMessage />
                  </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location / Room</FormLabel>
                   <FormControl>
                     <Input {...field} />
                  </FormControl>
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
