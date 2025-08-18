
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
import { Badge }from "@/components/ui/badge";
import { format } from "date-fns";
import type { StudentAssignment } from "../page";

interface ViewAssignmentDialogProps {
  assignment: StudentAssignment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentSubmitted: (assignmentId: string) => void;
}

export function ViewAssignmentDialog({
  assignment,
  isOpen,
  onOpenChange,
  onAssignmentSubmitted,
}: ViewAssignmentDialogProps) {
  if (!assignment) return null;

  const handleSubmission = () => {
    onAssignmentSubmitted(assignment.id);
    onOpenChange(false);
  };

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
        
        <div className="py-4 space-y-4">
            <h3 className="font-semibold">Assignment Instructions</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {assignment.description || "No description provided."}
            </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmission}
            disabled={assignment.studentStatus === 'Submitted' || assignment.studentStatus === 'Graded'}
          >
            {assignment.studentStatus === 'Submitted' ? 'Submitted' : 'Submit Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
