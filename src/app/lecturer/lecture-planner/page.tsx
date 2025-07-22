"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const mockPlan = {
  introduction: {
    title: "Introduction (10 minutes)",
    points: [
      "Hook: Start with a real-world problem that dynamic programming solves (e.g., shortest path in a GPS).",
      "Define dynamic programming and its two key properties: optimal substructure and overlapping subproblems.",
      "Briefly introduce the Fibonacci sequence as a classic example.",
    ],
  },
  mainActivity: {
    title: "Main Activity: Solving Fibonacci (25 minutes)",
    points: [
      "Demonstrate the naive recursive solution and highlight its inefficiency using a recursion tree.",
      "Introduce memoization (top-down DP) and code the solution live.",
      "Introduce tabulation (bottom-up DP) and explain how it builds the solution from the ground up.",
    ],
  },
  conclusion: {
    title: "Conclusion & Q&A (15 minutes)",
    points: [
      "Recap the differences between memoization and tabulation.",
      "Present other common DP problems (e.g., Knapsack, Longest Common Subsequence).",
      "Open the floor for questions.",
    ],
  },
};

export default function LecturePlannerPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<typeof mockPlan | null>(null);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedPlan(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratedPlan(mockPlan);
    setIsGenerating(false);
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
            <Accordion type="single" collapsible defaultValue="introduction" className="w-full">
              <AccordionItem value="introduction">
                <AccordionTrigger className="font-semibold">{generatedPlan.introduction.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    {generatedPlan.introduction.points.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="mainActivity">
                <AccordionTrigger className="font-semibold">{generatedPlan.mainActivity.title}</AccordionTrigger>
                <AccordionContent>
                   <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    {generatedPlan.mainActivity.points.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="conclusion">
                <AccordionTrigger className="font-semibold">{generatedPlan.conclusion.title}</AccordionTrigger>
                <AccordionContent>
                   <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    {generatedPlan.conclusion.points.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
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
