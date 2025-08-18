
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
import { PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Course {
    id: string;
    title: string;
    code: string;
}

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required."),
  courseId: z.string().min(1, "Please select a course."),
  description: z.string().min(1, "Description is required."),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  assignmentFile: z.instanceof(File).optional(),
});

export function CreateAssignmentDialog({ onAssignmentCreated }: { onAssignmentCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const { toast } = useToast();
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      courseId: "",
      description: "",
    }
  });

  const fetchCourses = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
        const q = query(collection(db, "courses"), where("lecturerId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const coursesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Course[];
        setCourses(coursesData);
    } catch (error) {
        console.error("Error fetching courses for dropdown: ", error);
    }
  }, [db, auth]);

  useEffect(() => {
    if(open) {
        fetchCourses();
    }
  }, [open, fetchCourses]);


  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    if (!auth.currentUser) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }

    const selectedCourse = courses.find(c => c.id === values.courseId);
    if (!selectedCourse) {
        toast({ title: "Error", description: "Selected course not found.", variant: "destructive" });
        return;
    }

    try {
      let fileURL = "";
      if (values.assignmentFile) {
        const file = values.assignmentFile;
        const storageRef = ref(storage, `assignments/${selectedCourse.code}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(snapshot.ref);
      }
        
      await addDoc(collection(db, "assignments"), {
        title: values.title,
        courseId: values.courseId,
        description: values.description,
        dueDate: values.dueDate,
        lecturerId: auth.currentUser.uid,
        course: selectedCourse.code,
        createdAt: serverTimestamp(),
        status: "Open",
        submissions: 0,
        fileURL: fileURL,
      });

      toast({
        title: "Success",
        description: "Assignment created successfully.",
      });
      form.reset();
      onAssignmentCreated();
      setOpen(false);
    } catch (error) {
      console.error("Error creating assignment: ", error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Create New Assignment
          </DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new assignment.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Title</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="e.g., Problem Set 4" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-2" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="col-span-3">
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
                  <FormMessage className="col-span-4 col-start-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4">
                  <FormLabel className="text-right pt-2">Description</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea
                      placeholder="Provide instructions for the assignment."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-2" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl className="col-span-3">
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                   <FormMessage className="col-span-4 col-start-2" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignmentFile"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">File</FormLabel>
                   <FormControl className="col-span-3">
                     <Input 
                        type="file" 
                        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                        {...rest} 
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-2" />
                </FormItem>
              )}
            />


            <DialogFooter>
               <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Assignment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
