
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { generateSyllabus } from "@/ai/flows/generate-syllabus-flow";
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import { marked } from 'marked';


export default function SyllabusGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState("");
  const { toast } = useToast();

  const [courseTitle, setCourseTitle] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [courseDetails, setCourseDetails] = useState("");


  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedSyllabus("");
    
    try {
      const result = await generateSyllabus({
        courseTitle,
        learningObjectives,
        additionalDetails: courseDetails,
      });
      const htmlResult = await marked(result.syllabusContent);
      setGeneratedSyllabus(htmlResult);
    } catch (error) {
       console.error(error);
       toast({
        title: "Error Generating Syllabus",
        description: "There was an issue with the AI service. Please check your API key or try again later.",
        variant: "destructive",
       });
    } finally {
        setIsGenerating(false);
    }
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
              <Input id="courseTitle" name="courseTitle" placeholder="e.g., Introduction to Quantum Physics" required value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learningObjectives">Learning Objectives</Label>
              <Textarea
                id="learningObjectives"
                name="learningObjectives"
                placeholder="List the key skills and knowledge students will acquire, one per line."
                rows={5}
                required
                value={learningObjectives} 
                onChange={(e) => setLearningObjectives(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseDetails">Additional Details (Optional)</Label>
              <Textarea
                id="courseDetails"
                name="courseDetails"
                placeholder="Include details like required textbooks, course duration, prerequisites, etc."
                rows={3}
                value={courseDetails}
                onChange={(e) => setCourseDetails(e.target.value)}
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
             <div
              className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/50 p-4"
              dangerouslySetInnerHTML={{ __html: generatedSyllabus }}
            />
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
