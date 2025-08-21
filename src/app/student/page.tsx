
"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { getFirestore, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Bell, Activity, Loader2, CalendarClock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow, addDays, getDay, setHours, setMinutes } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";


interface UpcomingDeadline {
    id: string;
    title: string;
    course: string;
    due: string;
    dueDate: Date;
}

interface ScheduleEntry {
    day: string;
    startTime: string;
    endTime: string;
}

interface RecurringLecture {
    id: string;
    courseName: string;
    location: string;
    lecturerId: string;
    courseId: string;
    schedule: ScheduleEntry[];
}

interface LectureInstance {
  id: string;
  courseName: string;
  startTime: Date;
  location: string;
}

const weekdaysMap: { [key: string]: number } = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };

const generateUpcomingLectures = (lectures: RecurringLecture[]): LectureInstance[] => {
    const instances: LectureInstance[] = [];
    const today = new Date();
    const fourWeeksFromNow = addDays(today, 28);

    lectures.forEach(lecture => {
        lecture.schedule.forEach(slot => {
            const targetDay = weekdaysMap[slot.day];
            let current = today;

            while (current <= fourWeeksFromNow) {
                if (getDay(current) === targetDay) {
                    const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
                    const lectureDate = setMinutes(setHours(current, startHours), startMinutes);
                    
                    if(lectureDate > new Date()) { // Only add future lectures
                        instances.push({
                            id: `${lecture.id}-${format(lectureDate, 'yyyy-MM-dd')}`,
                            startTime: lectureDate,
                            courseName: lecture.courseName,
                            location: lecture.location,
                        });
                    }
                }
                current = addDays(current, 1);
            }
        });
    });

    return instances.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};


export default function StudentDashboardPage() {
  const [userName, setUserName] = useState("Student");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, deadlines: 0, grades: 0 });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [upcomingLectures, setUpcomingLectures] = useState<LectureInstance[]>([]);


  const auth = getAuth(app);
  const db = getFirestore(app);

  const fetchStudentData = useCallback(async (user: User) => {
    setIsLoading(true);
    try {
        // Get enrolled course IDs
        const enrolledCourseIds: string[] = [];
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        for (const courseDoc of coursesSnapshot.docs) {
            const enrollmentQuery = query(collection(db, `courses/${courseDoc.id}/enrolledStudents`), where("uid", "==", user.uid));
            const enrollmentSnapshot = await getDocs(enrollmentQuery);
            if (!enrollmentSnapshot.empty) {
                enrolledCourseIds.push(courseDoc.id);
            }
        }

        let deadlines: UpcomingDeadline[] = [];
        let lectures: LectureInstance[] = [];

        if (enrolledCourseIds.length > 0) {
            const assignmentsQuery = query(collection(db, "assignments"), where("courseId", "in", enrolledCourseIds));
            const assignmentsSnapshot = await getDocs(assignmentsQuery);
            deadlines = assignmentsSnapshot.docs
                .map(doc => {
                    const data = doc.data();
                    const dueDate = data.dueDate.toDate();
                    return {
                        id: doc.id,
                        title: data.title,
                        course: data.course,
                        due: formatDistanceToNow(dueDate, { addSuffix: true }),
                        dueDate: dueDate,
                    };
                })
                .filter(d => d.dueDate > new Date()) // Only show upcoming deadlines
                .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by soonest
            
            const lecturesQuery = query(collection(db, "lectures"), where("courseId", "in", enrolledCourseIds));
            const lecturesSnapshot = await getDocs(lecturesQuery);
            const recurringLectures = lecturesSnapshot.docs.map(doc => ({
                id: doc.id, ...doc.data()
            })) as RecurringLecture[];
            lectures = generateUpcomingLectures(recurringLectures);
        }
        
        // In a real app, recent grades would be another query
        const recentGradesCount = 0;

        setStats({
            courses: enrolledCourseIds.length,
            deadlines: deadlines.length,
            grades: recentGradesCount,
        });
        setUpcomingDeadlines(deadlines.slice(0, 3)); // Show top 3
        setUpcomingLectures(lectures.slice(0, 3));

    } catch (error) {
        console.error("Error fetching student dashboard data: ", error);
    } finally {
        setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fullName = user.displayName || "Student";
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);
        await fetchStudentData(user);
      } else {
        setIsLoading(false);
        setUserName("Student");
        setStats({ courses: 0, deadlines: 0, grades: 0 });
        setUpcomingDeadlines([]);
      }
    });
    return () => unsubscribe();
  }, [auth, fetchStudentData]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Welcome, {userName}!</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <div className="text-2xl font-bold">{stats.courses}</div>}
            <p className="text-xs text-muted-foreground">View your courses and materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <div className="text-2xl font-bold">{stats.deadlines}</div>}
            <p className="text-xs text-muted-foreground">Assignments due soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lectures</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <div className="text-2xl font-bold">{upcomingLectures.length}</div>}
            <p className="text-xs text-muted-foreground">Lectures in the next few days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Stay on top of your assignments.</CardDescription>
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : upcomingDeadlines.length > 0 ? (
                <div className="space-y-6">
                    {upcomingDeadlines.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold">{item.title} <span className="text-muted-foreground font-normal">- {item.course}</span></h3>
                        <span className="text-sm text-muted-foreground">{item.due}</span>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>No upcoming deadlines. You're all caught up!</p>
                </div>
            )}
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Lectures</CardTitle>
            <CardDescription>Your schedule for the next few days.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : upcomingLectures.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                  <p>No upcoming lectures scheduled.</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingLectures.map((lecture) => (
                  <TableRow key={lecture.id}>
                    <TableCell className="font-medium">{lecture.courseName}</TableCell>
                    <TableCell>{format(lecture.startTime, 'PPp')}</TableCell>
                    <TableCell>
                      <Badge variant={lecture.location === "Online" ? "default" : "secondary"}>
                        {lecture.location}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
