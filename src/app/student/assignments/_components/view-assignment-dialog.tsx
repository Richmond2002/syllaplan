
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
import { Badge }from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { StudentAssignment } from "../page";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ViewAssignmentDialogProps {
  assignment: StudentAssignment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentSubmitted: (assignmentId: string, file: File) => void;
}

export function ViewAssignmentDialog({
  assignment,
  isOpen,
  onOpenChange,
  onAssignmentSubmitted,
}: ViewAssignmentDialogProps) {
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!assignment) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setSubmissionFile(e.target.files[0]);
    }
  }

  const handleSubmission = async () => {
    if (!submissionFile) {
        toast({
            title: "No file selected",
            description: "Please select a file to submit.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    await onAssignmentSubmitted(assignment.id, submissionFile);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const isSubmitted = assignment.studentStatus === 'Submitted' || assignment.studentStatus === 'Graded';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{assignment.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4 text-sm mt-2">
                <Badge variant="outline">{assignment.course}</Badge>
                <span>Due: {format(assignment.dueDate.toDate(), 'PPP')}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
            <div>
                <h3 className="font-semibold">Assignment Instructions</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                    {assignment.description || "No description provided."}
                </p>
            </div>

            {assignment.fileURL && (
                <div>
                     <h3 className="font-semibold mb-2">Assignment File</h3>
                     <Button asChild variant="outline">
                        <a href={assignment.fileURL} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download Assignment
                        </a>
                    </Button>
                </div>
            )}
            
            {!isSubmitted && (
                <div className="space-y-2">
                    <Label htmlFor="submission-file" className="font-semibold">Submit Your Work</Label>
                    <Input id="submission-file" type="file" onChange={handleFileChange} />
                </div>
            )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmission}
            disabled={isSubmitted || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitted ? 'Submitted' : 'Submit Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
