
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Download } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateLecturePlan, type GenerateLecturePlanOutput } from "@/ai/flows/generate-lecture-plan-flow";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function LecturePlannerPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateLecturePlanOutput | null>(null);
  const { toast } = useToast();
  const [lectureTopic, setLectureTopic] = useState("");
  const planRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedPlan(null);
    
    const formData = new FormData(e.currentTarget);
    const topic = formData.get("lectureTopic") as string;
    const learningObjectives = formData.get("learningObjectives") as string;
    const duration = parseInt(formData.get("duration") as string, 10);
    setLectureTopic(topic);

    try {
        const result = await generateLecturePlan({
            topic: topic,
            objectives: learningObjectives,
            duration,
        });
        setGeneratedPlan(result);
    } catch (error) {
        console.error(error);
        toast({
            title: "Error Generating Plan",
            description: "There was an issue with the AI service. Please try again later.",
            variant: "destructive",
        });
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleExport = () => {
    if (!planRef.current) return;

    html2canvas(planRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      let imgWidth = pdfWidth;
      let imgHeight = pdfWidth / ratio;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${lectureTopic || 'lecture-plan'}.pdf`);
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Lecture Plan Generator</CardTitle>
          <CardDescription>Provide a topic and objectives to generate a detailed lecture plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lectureTopic">Lecture Topic</Label>
              <Input id="lectureTopic" name="lectureTopic" placeholder="e.g., Dynamic Programming" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learningObjectives">Learning Objectives for this Lecture</Label>
              <Textarea
                id="learningObjectives"
                name="learningObjectives"
                placeholder="e.g., Understand memoization vs. tabulation, Solve Fibonacci using DP..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Lecture Duration (minutes)</Label>
              <Input id="duration" name="duration" type="number" placeholder="e.g., 50" defaultValue="50" required />
            </div>
            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Planning...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Lecture Plan
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
                    <CardTitle className="font-headline text-2xl">Generated Lecture Plan</CardTitle>
                    <CardDescription>A suggested structure for your lecture. Expand each section for details.</CardDescription>
                </div>
                <Button onClick={handleExport} disabled={!generatedPlan || isGenerating} variant="outline">
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
                    <p className="text-muted-foreground">The AI is structuring your lecture...</p>
                </div>
            </div>
          )}
          <div ref={planRef} className="p-4">
          {generatedPlan && (
            <Accordion type="multiple" defaultValue={["introduction"]} className="w-full">
              {generatedPlan.sections.map((section, index) => (
                 <AccordionItem value={section.title.toLowerCase().replace(/\s/g, '-')} key={index}>
                    <AccordionTrigger className="font-semibold">{section.title} ({section.duration} minutes)</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                        {section.points.map((point, i) => <li key={i}>{point}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
          )}
          </div>
          {!isGenerating && !generatedPlan && (
             <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                    <p>Your generated lecture plan will appear here.</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
