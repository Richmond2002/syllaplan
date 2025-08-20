
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

interface ScheduleEntry {
    day: string; // "Monday", "Tuesday", etc.
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
}

interface RecurringLecture {
    id: string;
    courseName: string;
    location: string;
    schedule: ScheduleEntry[];
}

interface ScheduleEvent {
    id: string;
    date: Date;
    type: 'assignment' | 'lecture';
    title: string;
    course: string;
    location?: string;
}

const weekdaysMap: { [key: string]: number } = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };

// Generates lecture instances for the next 4 weeks from a recurring schedule
const generateLectureInstances = (lecture: RecurringLecture): ScheduleEvent[] => {
    const instances: ScheduleEvent[] = [];
    const today = new Date();
    const fourWeeksFromNow = addDays(today, 28);

    lecture.schedule.forEach(slot => {
        const targetDay = weekdaysMap[slot.day];
        let current = today;

        // Find the next occurrence of the target day
        current = addDays(current, (targetDay - getDay(current) + 7) % 7);
        
        while (current <= fourWeeksFromNow) {
            const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
            const lectureDate = setMinutes(setHours(current, startHours), startMinutes);

            instances.push({
                id: `${lecture.id}-${format(lectureDate, 'yyyy-MM-dd')}`,
                date: lectureDate,
                type: 'lecture',
                title: lecture.courseName,
                course: lecture.courseName,
                location: lecture.location,
            });
            
            // Move to the next week
            current = addDays(current, 7);
        }
    });
    return instances;
};

export default function SchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const fetchScheduleData = useCallback(async (user: User) => {
        setIsLoading(true);
        try {
            // Fetch assignments (no change here)
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

            // Fetch recurring lectures
            const lecturesQuery = query(
                collection(db, "lectures"),
                where("lecturerId", "==", user.uid)
            );
            const lecturesSnapshot = await getDocs(lecturesQuery);
            const recurringLectures = lecturesSnapshot.docs.map(doc => ({
                 id: doc.id,
                 ...doc.data()
            })) as RecurringLecture[];

            const lectureInstances = recurringLectures.flatMap(generateLectureInstances);
            
            setEvents([...assignmentsData, ...lectureInstances]);
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
                    <p className="text-muted-foreground">An overview of your scheduled lectures and assignment deadlines.</p>
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
                            Events for {date ? format(date, 'PPP') : '...'}
                        </CardTitle>
                        <CardDescription>
                            {eventsForSelectedDate.length > 0 
                                ? `You have ${eventsForSelectedDate.length} event(s) scheduled.`
                                : 'No events scheduled for this day.'}
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
                                    <p>Select a date to see event details.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
