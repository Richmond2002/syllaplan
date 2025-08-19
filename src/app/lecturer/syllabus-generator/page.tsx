
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Download } from "lucide-react";
import { generateSyllabus } from "@/ai/flows/generate-syllabus-flow";
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import { marked } from 'marked';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function SyllabusGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState("");
  const { toast } = useToast();

  const [courseTitle, setCourseTitle] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [courseDetails, setCourseDetails] = useState("");
  const syllabusRef = useRef<HTMLDivElement>(null);


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

  const handleExport = () => {
    if (!syllabusRef.current) return;

    html2canvas(syllabusRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;

        // Check if content exceeds one page
        let position = 0;
        if (height > pdfHeight) {
             let remainingHeight = canvasHeight;
             while (remainingHeight > 0) {
                 const pageCanvas = document.createElement('canvas');
                 pageCanvas.width = canvasWidth;
                 pageCanvas.height = Math.min(canvasHeight * pdfHeight/height, remainingHeight);
                 const pageCtx = pageCanvas.getContext('2d');
                 pageCtx?.drawImage(canvas, 0, position, canvasWidth, pageCanvas.height, 0, 0, canvasWidth, pageCanvas.height);
                 const pageImgData = pageCanvas.toDataURL('image/png');
                 if(position > 0) {
                     pdf.addPage();
                 }
                 pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight * (pageCanvas.height / (canvasHeight * pdfHeight/height)));
                 position += pageCanvas.height;
                 remainingHeight -= pageCanvas.height;
             }
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        }

        pdf.save(`${courseTitle || 'syllabus'}.pdf`);
    });
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-2xl">Generated Syllabus</CardTitle>
              <CardDescription>Review, edit, and copy the AI-generated content below.</CardDescription>
            </div>
             <Button onClick={handleExport} disabled={!generatedSyllabus || isGenerating} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
          </div>
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
          
          <div ref={syllabusRef} className="p-4">
             {generatedSyllabus && (
                <div
                    className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/50 p-4"
                    dangerouslySetInnerHTML={{ __html: generatedSyllabus }}
                />
              )}
          </div>
         
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
