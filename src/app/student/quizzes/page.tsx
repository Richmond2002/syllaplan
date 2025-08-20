
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

interface FormattedQuestion {
    question: string;
    answers: string[];
    correctAnswer: string;
}

// Basic HTML entity decoder
const decodeEntities = (text: string) => {
    if (typeof window === 'undefined') {
      // Basic decoding for server-side if needed, though this component is client-side
      return text.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&");
    }
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export default function StudentQuizzesPage() {
    const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuizzes = useCallback(async () => {
        setIsLoading(true);
        setQuizFinished(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        try {
            const response = await fetch("https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple");
            const data = await response.json();
            if (data.results) {
                const formattedQuestions = data.results.map((q: QuizQuestion) => ({
                    question: decodeEntities(q.question),
                    answers: shuffleArray([
                        decodeEntities(q.correct_answer), 
                        ...q.incorrect_answers.map(decodeEntities)
                    ]),
                    correctAnswer: decodeEntities(q.correct_answer),
                }));
                setQuestions(formattedQuestions);
            }
        } catch (error) {
            console.error("Failed to fetch quiz questions:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    const handleAnswerClick = (answer: string) => {
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 1);
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setQuizFinished(true);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Computer Science Quiz</h1>
                <p className="text-muted-foreground">Test your knowledge with these trivia questions.</p>
            </div>
            <div className="flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Quiz in Progress</CardTitle>
                        <CardDescription>
                            {quizFinished ? "Quiz Completed!" : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : quizFinished ? (
                            <div className="text-center space-y-4">
                                <p className="text-2xl font-bold">
                                    You scored {score} out of {questions.length}!
                                </p>
                                <Button onClick={fetchQuizzes}>Try Again</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Progress value={progress} className="w-full" />
                                <p className="text-lg font-semibold text-center min-h-[6rem] flex items-center justify-center">
                                    {currentQuestion?.question}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQuestion?.answers.map((answer, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-auto py-3 whitespace-normal"
                                            onClick={() => handleAnswerClick(answer)}
                                        >
                                            {answer}
                                        </Button>
                                    ))}
                                </div>
                                <div className="text-center text-muted-foreground mt-4">
                                    Score: {score}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
