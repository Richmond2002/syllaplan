import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quizzes = [
    { id: "QZ001", title: "Week 5 Quiz", course: "Quantum Physics 101", status: "Available", attempts: "0/1" },
    { id: "QZ002", title: "Midterm Review Quiz", course: "Advanced Algorithms", status: "Available", attempts: "0/2" },
    { id: "QZ003", title: "Week 4 Quiz", course: "Quantum Physics 101", status: "Completed", score: "9/10" },
    { id: "QZ004", title: "HCI Principles", course: "HCI", status: "Closed", score: "N/A" },
];

export default function StudentQuizzesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">My Quizzes</h1>
                <p className="text-muted-foreground">Test your knowledge and prepare for exams.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {quizzes.map((quiz) => (
                    <Card key={quiz.id}>
                        <CardHeader>
                            <CardTitle>{quiz.title}</CardTitle>
                            <CardDescription>{quiz.course}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold">{quiz.status}</p>
                                {quiz.status === 'Completed' || quiz.status === 'Closed' ? (
                                    <p className="text-sm text-muted-foreground">Score: {quiz.score}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Attempts: {quiz.attempts}</p>
                                )}
                            </div>
                            <Button disabled={quiz.status !== 'Available'}>
                                {quiz.status === 'Available' ? 'Start Quiz' : 'View Results'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
