
"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, Timestamp, orderBy, limit } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookCopy, CalendarClock, ClipboardCheck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, addDays, getDay, setHours, setMinutes } from "date-fns";

interface ScheduleEntry {
    day: string;
    startTime: string;
    endTime: string;
}

interface RecurringLecture {
    id: string;
    courseName: string;
    location: string;
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


export default function LecturerDashboardPage() {
  const [userName, setUserName] = useState("Lecturer");
  const [stats, setStats] = useState({ courses: 0, assignmentsToGrade: 0 });
  const [upcomingLectures, setUpcomingLectures] = useState<LectureInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  const fetchLecturerData = useCallback(async (user: User) => {
    setIsLoading(true);
    try {
      // Fetch courses
      const coursesQuery = query(collection(db, "courses"), where("lecturerId", "==", user.uid));
      const coursesSnapshot = await getDocs(coursesQuery);
      const courseCount = coursesSnapshot.size;
      
      // Fetch assignments needing grading (mock for now)
      const assignmentsToGradeCount = 0;

      // Fetch recurring lectures and generate upcoming instances
      const lecturesQuery = query(
        collection(db, "lectures"),
        where("lecturerId", "==", user.uid)
      );
      const lecturesSnapshot = await getDocs(lecturesQuery);
      const recurringLectures = lecturesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringLecture[];

      const allUpcoming = generateUpcomingLectures(recurringLectures);
      setUpcomingLectures(allUpcoming.slice(0, 2));

      setStats({
        courses: courseCount,
        assignmentsToGrade: assignmentsToGradeCount,
      });

    } catch (error) {
      console.error("Error fetching lecturer data: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const fullName = currentUser.displayName || "Lecturer";
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);
        await fetchLecturerData(currentUser);
      } else {
        setUserName("Lecturer");
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, fetchLecturerData]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font.headline font-bold">Welcome back, {userName}!</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.courses}</div>}
            <p className="text-xs text-muted-foreground">Active courses this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lectures</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{upcomingLectures.length}</div>}
            <p className="text-xs text-muted-foreground">Scheduled in the next few days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments to Grade</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.assignmentsToGrade}</div>}
            <p className="text-xs text-muted-foreground">Submissions awaiting feedback</p>
          </CardContent>
        </Card>
      </div>

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
                <p className="text-sm">Lectures will appear here once scheduled by an admin.</p>
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
  );
}
