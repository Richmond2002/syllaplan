
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFirestore, doc, updateDoc, collection, getDocs } from "firebase/firestore";
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

const scheduleEntrySchema = z.object({
  id: z.string().optional(), // Keep track of original objects if needed
  day: z.string(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
}).refine(data => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

const lectureSchema = z.object({
  courseId: z.string().min(1, "Please select a course."),
  location: z.string().min(1, "Location is required."),
  schedule: z.array(scheduleEntrySchema).min(1, "Please select at least one day for the lecture."),
});

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

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
  
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "schedule",
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
        if (lecture) {
            form.reset({
                courseId: lecture.courseId,
                location: lecture.location,
                schedule: lecture.schedule || [],
            });
        }
    }
  }, [lecture, isOpen, fetchCourses, form]);

   const handleDayCheckedChange = (checked: boolean, day: string) => {
    const dayIndex = fields.findIndex(field => field.day === day);
    if (checked && dayIndex === -1) {
        append({ day, startTime: "09:00", endTime: "11:00" });
    } else if (!checked && dayIndex > -1) {
        remove(dayIndex);
    }
  }

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof lectureSchema>) => {
    if (!lecture) return;
    
    const selectedCourse = courses.find(c => c.id === values.courseId);
    if (!selectedCourse) {
        toast({ title: "Error", description: "Selected course not found.", variant: "destructive" });
        return;
    }

    try {
      const lectureRef = doc(db, "lectures", lecture.id);
      await updateDoc(lectureRef, {
        courseId: values.courseId,
        courseName: `${selectedCourse.title} (${selectedCourse.code})`,
        location: values.location,
        lecturerId: selectedCourse.lecturerId,
        schedule: values.schedule.sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day)),
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Edit Lecture
          </DialogTitle>
          <DialogDescription>
            Update the details for this recurring lecture.
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

            <div className="space-y-4">
                <FormLabel>Weekly Schedule</FormLabel>
                <div className="space-y-4 rounded-md border p-4">
                    {weekdays.map((day) => (
                        <div key={day}>
                             <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={`edit-${day}`}
                                    checked={fields.some(field => field.day === day)}
                                    onCheckedChange={(checked) => handleDayCheckedChange(!!checked, day)}
                                />
                                <label htmlFor={`edit-${day}`} className="text-sm font-medium leading-none">
                                    {day}
                                </label>
                            </div>
                            {fields.map((field, index) => field.day === day && (
                               <div key={field.id} className="grid grid-cols-2 gap-4 mt-2 pl-6">
                                    <FormField
                                        control={form.control}
                                        name={`schedule.${index}.startTime`}
                                        render={({ field: timeField }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Start Time</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...timeField} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name={`schedule.${index}.endTime`}
                                        render={({ field: timeField }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">End Time</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...timeField} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                               </div>
                            ))}
                        </div>
                    ))}
                </div>
                 <FormMessage>{form.formState.errors.schedule?.message}</FormMessage>
            </div>

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
