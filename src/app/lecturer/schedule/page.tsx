
"use client";

import { useState, useEffect, useCallback }from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { format, addDays, getDay, setHours, setMinutes, parse } from 'date-fns';
import { getFirestore, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { Loader2 } from 'lucide-react';

interface ScheduleEvent {
    id: string;
    date: Date;
    type: 'assignment' | 'lecture';
    title: string;
    course: string;
    location?: string;
}

export default function SchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const fetchScheduleData = useCallback(async (user: User) => {
        setIsLoading(true);
        try {
            // Fetch assignments for the calendar
            const assignmentsQuery = query(
                collection(db, "assignments"),
                where("lecturerId", "==", user.uid)
            );
            const assignmentsSnapshot = await getDocs(assignmentsQuery);
            const assignmentsData = assignmentsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    date: (data.dueDate as Timestamp).toDate(),
                    type: 'assignment' as const,
                    title: `Due: ${data.title}`,
                    course: data.course,
                };
            });
            
            setEvents(assignmentsData);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setIsLoading(false);
        }
    }, [db]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchScheduleData(user);
            } else {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [auth, fetchScheduleData]);

    const eventsForSelectedDate = date 
        ? events.filter(event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).sort((a,b) => a.date.getTime() - b.date.getTime())
        : [];
    
    const eventDates = events.map(e => e.date);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-3xl font-headline font-bold">My Schedule</h1>
                    <p className="text-muted-foreground">An overview of your assignment deadlines.</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 flex justify-center items-center">
                   {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                   ) : (
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-0"
                        modifiers={{
                            events: eventDates
                        }}
                        modifiersStyles={{
                           events: {
                                color: 'hsl(var(--primary-foreground))',
                                backgroundColor: 'hsl(var(--primary))',
                           }
                        }}
                    />
                   )}
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">
                            Deadlines for {date ? format(date, 'PPP') : '...'}
                        </CardTitle>
                        <CardDescription>
                            {eventsForSelectedDate.length > 0 
                                ? `You have ${eventsForSelectedDate.length} deadline(s) scheduled.`
                                : 'No deadlines scheduled for this day.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : eventsForSelectedDate.length > 0 ? (
                            <ul className="space-y-4">
                                {eventsForSelectedDate.map((event) => (
                                    <li key={event.id} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                                        <div className="font-semibold text-lg text-primary">{format(event.date, 'p')}</div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold">{event.title}</p>
                                                <Badge 
                                                    variant={event.type === 'lecture' ? 'default' : 'secondary'}
                                                >
                                                    {event.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{event.course}</p>
                                            {event.location && <p className="text-sm text-muted-foreground">Location: {event.location}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                                <div className="text-center text-muted-foreground">
                                    <p>Select a date to see deadline details.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
