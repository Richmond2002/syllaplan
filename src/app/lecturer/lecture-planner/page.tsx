
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateLecturePlan, type GenerateLecturePlanOutput } from "@/ai/flows/generate-lecture-plan-flow";
import { useToast } from "@/hooks/use-toast";

export default function LecturePlannerPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateLecturePlanOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedPlan(null);
    
    const formData = new FormData(e.currentTarget);
    const lectureTopic = formData.get("lectureTopic") as string;
    const learningObjectives = formData.get("learningObjectives") as string;
    const duration = parseInt(formData.get("duration") as string, 10);

    try {
        const result = await generateLecturePlan({
            topic: lectureTopic,
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
          <CardTitle className="font-headline text-2xl">Generated Lecture Plan</CardTitle>
          <CardDescription>A suggested structure for your lecture. Expand each section for details.</CardDescription>
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
