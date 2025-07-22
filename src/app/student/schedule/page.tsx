
"use client";

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const scheduleData: { [key: string]: { time: string; type: 'lecture' | 'assignment' | 'exam'; title: string; course: string }[] } = {
    '2024-06-18': [
        { time: '10:00 AM', type: 'lecture', title: 'Dynamic Programming', course: 'CS203' },
        { time: '2:00 PM', type: 'lecture', title: 'Wave-particle Duality', course: 'PHY101' },
    ],
    '2024-06-20': [
        { time: '11:59 PM', type: 'assignment', title: 'Problem Set 3 Due', course: 'CS203' },
    ],
    '2024-06-25': [
        { time: '1:00 PM', type: 'exam', title: 'Midterm Exam', course: 'PHY101' },
    ],
};

export default function StudentSchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    const eventsForDate = scheduleData[formattedDate] || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">My Schedule</h1>
                <p className="text-muted-foreground">An overview of your lectures, deadlines, and exams.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 flex justify-center items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-0"
                    />
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">
                            Events for {date ? format(date, 'PPP') : '...'}
                        </CardTitle>
                        <CardDescription>
                            {eventsForDate.length > 0 
                                ? `You have ${eventsForDate.length} event(s) scheduled.`
                                : 'No events scheduled for this day.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {eventsForDate.length > 0 ? (
                            <ul className="space-y-4">
                                {eventsForDate.map((event, index) => (
                                    <li key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                                        <div className="font-semibold text-lg text-primary">{event.time}</div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold">{event.title}</p>
                                                <Badge 
                                                    variant={event.type === 'exam' ? 'destructive' : event.type === 'assignment' ? 'default' : 'secondary'}
                                                >
                                                    {event.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{event.course}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                                <div className="text-center text-muted-foreground">
                                    <p>Select a date with an event to see details.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
