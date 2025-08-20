
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
import { Download, Loader2, FileCheck, Clock } from "lucide-react";
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
    // Reset file input after closing
    setSubmissionFile(null);
  };

  const isSubmitted = assignment.studentStatus === 'Submitted' || assignment.studentStatus === 'Graded';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{assignment.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm mt-2 space-x-4">
                <Badge variant="outline">{assignment.course}</Badge>
                <span>Due: {format(assignment.dueDate.toDate(), 'PPP p')}</span>
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
            
            <hr/>
            
            {isSubmitted ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center"><FileCheck className="mr-2"/>Your Submission</h3>
                    <div className="text-sm mt-2 space-y-2">
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground"/> Submitted on: {format(assignment.submissionDetails!.submittedAt.toDate(), 'PPP p')}</p>
                        <Button asChild variant="secondary" size="sm">
                             <a href={assignment.submissionDetails!.fileURL} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-3 w-3" />
                                Download Your Submission
                            </a>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="submission-file" className="font-semibold">Submit Your Work</Label>
                    <Input id="submission-file" type="file" onChange={handleFileChange} />
                    <p className="text-xs text-muted-foreground">Please select the file you wish to submit.</p>
                </div>
            )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {!isSubmitted && (
            <Button 
                onClick={handleSubmission}
                disabled={isSubmitting || !submissionFile}
            >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Assignment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
