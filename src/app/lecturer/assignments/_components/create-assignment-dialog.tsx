
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
import { Label } from "@/components/ui/label";
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
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required."),
  course: z.string().min(1, "Please select a course."),
  description: z.string().min(1, "Description is required."),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
});

export function CreateAssignmentDialog({ onAssignmentCreated }: { onAssignmentCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const db = getFirestore(app);

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      course: "",
      description: "",
    }
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    try {
      await addDoc(collection(db, "assignments"), {
        ...values,
        createdAt: serverTimestamp(),
        status: "Open",
        submissions: 0,
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
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="course"
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
                      <SelectItem value="CS203">Advanced Algorithms</SelectItem>
                      <SelectItem value="PHY101">Quantum Physics 101</SelectItem>
                      <SelectItem value="CS374">Human-Computer Interaction</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4" />
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
                  <FormMessage className="col-span-4" />
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
                   <FormMessage className="col-span-4" />
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
