
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import type { Lecturer } from "../page";
import { useEffect } from "react";

const lecturerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  department: z.string().min(1, "Department is required."),
});

interface EditLecturerDialogProps {
  lecturer: Lecturer | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLecturerUpdated: () => void;
}

export function EditLecturerDialog({ lecturer, isOpen, onOpenChange, onLecturerUpdated }: EditLecturerDialogProps) {
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

  useEffect(() => {
    if (lecturer) {
      form.reset(lecturer);
    }
  }, [lecturer, form]);


  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof lecturerSchema>) => {
    if (!lecturer) return;

    try {
      const lecturerRef = doc(db, "lecturers", lecturer.id);
      await updateDoc(lecturerRef, values);

      toast({
        title: "Success",
        description: "Lecturer profile updated successfully.",
      });
      onLecturerUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating lecturer: ", error);
      toast({
        title: "Error",
        description: "Failed to update lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Lecturer Profile</DialogTitle>
          <DialogDescription>
            Update the details for {lecturer?.name}.
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
                    <Input {...field} />
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
                    <Input type="email" {...field} />
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
