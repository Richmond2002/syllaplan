
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Lecturer } from "../page";

const lecturerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  department: z.string().min(1, "Department is required."),
});

export function CreateLecturerDialog({ onLecturerCreated }: { onLecturerCreated: (newLecturer: Omit<Lecturer, 'id' | 'createdAt'>) => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const db = getFirestore(app);

  const form = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof lecturerSchema>) => {
    try {
      const newLecturerData = {
        ...values,
        courses: 0,
        status: "Active" as const,
        createdAt: serverTimestamp(),
      };
      
      // We don't wait for addDoc to finish before updating UI
      addDoc(collection(db, "lecturers"), newLecturerData)
        .then(() => {
            // The onLecturerCreated callback will now handle the fetch
        }).catch(error => {
            console.error("Error creating lecturer: ", error);
            toast({
                title: "Error",
                description: "Failed to save lecturer to the database. The list may be out of sync.",
                variant: "destructive",
            });
        });

      toast({
        title: "Success",
        description: "Lecturer profile created successfully.",
      });

      // Optimistic update
      onLecturerCreated({
        ...values,
        courses: 0,
        status: "Active",
      });
      
      form.reset();
      setOpen(false);

    } catch (error) {
      console.error("Error preparing lecturer data: ", error);
      toast({
        title: "Error",
        description: "Failed to create lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lecturer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Lecturer</DialogTitle>
          <DialogDescription>
            Enter the details for the new lecturer profile.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Evelyn Reed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., e.reed@university.edu" {...field} />
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
                    <Input placeholder="e.g., Physics" {...field} />
                  </FormControl>
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
                Add Lecturer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
