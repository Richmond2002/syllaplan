"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SyllabusGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState("");

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedSyllabus("");
    
    // Mock AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const formData = new FormData(e.currentTarget);
    const courseTitle = formData.get("courseTitle") as string;
    
    const mockSyllabus = `
### Course Syllabus: ${courseTitle || "Introduction to Exampleology"}

**Course Description:**
An introductory course exploring the fundamental principles of Exampleology. Students will learn about the history, theory, and practical applications of examples in modern discourse.

**Learning Objectives:**
Upon successful completion of this course, students will be able to:
1.  Define and explain the core concepts of Exampleology.
2.  Analyze and critique the use of examples in various texts.
3.  Construct effective and persuasive examples for written and oral arguments.
4.  Understand the ethical implications of example usage.

**Weekly Schedule:**
-   **Week 1:** Introduction to Exampleology
-   **Week 2:** The History of Examples
-   **Week 3:** Theoretical Frameworks
-   **Week 4:** Midterm Exam
-   **Week 5:** Practical Application in Science
-   **Week 6:** Examples in the Humanities
-   ...and so on for the remainder of the semester.

**Assessment:**
-   Midterm Exam: 30%
-   Final Project: 40%
-   Weekly Quizzes: 20%
-   Participation: 10%
    `;
    setGeneratedSyllabus(mockSyllabus);
    setIsGenerating(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Syllabus Generator</CardTitle>
          <CardDescription>Input course details to automatically generate a structured syllabus.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="courseTitle">Course Title</Label>
              <Input id="courseTitle" name="courseTitle" placeholder="e.g., Introduction to Quantum Physics" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learningObjectives">Learning Objectives</Label>
              <Textarea
                id="learningObjectives"
                name="learningObjectives"
                placeholder="List the key skills and knowledge students will acquire, one per line."
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseDetails">Additional Details (Optional)</Label>
              <Textarea
                id="courseDetails"
                name="courseDetails"
                placeholder="Include details like required textbooks, course duration, prerequisites, etc."
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Syllabus
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Generated Syllabus</CardTitle>
          <CardDescription>Review, edit, and copy the AI-generated content below.</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-2">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">The AI is crafting your syllabus...</p>
                </div>
            </div>
          )}
          {generatedSyllabus && (
            <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-4 whitespace-pre-wrap font-sans">
                {generatedSyllabus}
            </div>
          )}
          {!isGenerating && !generatedSyllabus && (
             <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                    <p>Your generated syllabus will appear here.</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
