
"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { getFirestore, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Bell, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface UpcomingDeadline {
    id: string;
    title: string;
    course: string;
    due: string;
    dueDate: Date;
}

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState("Student");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, deadlines: 0, grades: 0 });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fullName = user.displayName || "Student";
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);

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
            }
            
            // In a real app, recent grades would be another query
            const recentGradesCount = 0;

            setStats({
                courses: enrolledCourseIds.length,
                deadlines: deadlines.length,
                grades: recentGradesCount,
            });
            setUpcomingDeadlines(deadlines.slice(0, 3)); // Show top 3

        } catch (error) {
            console.error("Error fetching student dashboard data: ", error);
        } finally {
            setIsLoading(false);
        }

      } else {
        setIsLoading(false);
        setUserName("Student");
        setStats({ courses: 0, deadlines: 0, grades: 0 });
        setUpcomingDeadlines([]);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

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
            <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <div className="text-2xl font-bold">{stats.grades}</div>}
            <p className="text-xs text-muted-foreground">New grades posted</p>
          </CardContent>
        </Card>
      </div>

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
          <CardTitle>Recent Grades</CardTitle>
          <CardDescription>A quick look at your latest results.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
           ) : stats.grades > 0 ? (
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* This would be populated by a real data fetch */}
            </TableBody>
          </Table>
           ) : (
             <div className="text-center text-muted-foreground py-10">
                <p>No grades have been posted yet.</p>
            </div>
           )}
          <div className="text-center mt-4">
            <Button variant="link" asChild>
              <Link href="/student/grades">View All Grades</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
