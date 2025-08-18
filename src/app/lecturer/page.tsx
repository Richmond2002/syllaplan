
"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookCopy, CalendarClock, ClipboardCheck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Lecture {
  id: string;
  course: string;
  topic: string;
  time: Timestamp;
  location: string;
}

export default function LecturerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("Lecturer");
  const [stats, setStats] = useState({ courses: 0, assignmentsToGrade: 0 });
  const [upcomingLectures, setUpcomingLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const fullName = currentUser.displayName || "Lecturer";
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);

        // Fetch lecturer specific data
        setIsLoading(true);
        try {
          // Fetch courses
          const coursesQuery = query(collection(db, "courses"), where("lecturerId", "==", currentUser.uid));
          const coursesSnapshot = await getDocs(coursesQuery);
          const courseCount = coursesSnapshot.size;
          
          // Fetch assignments needing grading (mock for now, as submissions aren't built)
          const assignmentsToGradeCount = 0; // Replace with real query later

          // Fetch upcoming lectures (mock for now, as schedule isn't fully built)
          const lecturesData: Lecture[] = [
            { id: '1', course: "Advanced Algorithms", topic: "Dynamic Programming", time: Timestamp.fromDate(new Date(Date.now() + 86400000)), location: "Room 301" },
            { id: '2', course: "Quantum Physics 101", topic: "Wave-particle Duality", time: Timestamp.fromDate(new Date(Date.now() + 86400000 * 2)), location: "Physics Hall A" },
          ];

          setStats({
            courses: courseCount,
            assignmentsToGrade: assignmentsToGradeCount,
          });
          setUpcomingLectures(lecturesData);

        } catch (error) {
          console.error("Error fetching lecturer data: ", error);
        } finally {
          setIsLoading(false);
        }

      } else {
        setUser(null);
        setUserName("Lecturer");
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Welcome back, {userName}!</h1>
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
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
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
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingLectures.map((lecture) => (
                <TableRow key={lecture.id}>
                  <TableCell className="font-medium">{lecture.course}</TableCell>
                  <TableCell>{lecture.topic}</TableCell>
                  <TableCell>{format(lecture.time.toDate(), 'PPp')}</TableCell>
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
