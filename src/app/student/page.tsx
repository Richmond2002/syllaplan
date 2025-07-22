
"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Bell, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const upcomingDeadlines = [
  { title: "Problem Set 3", course: "Advanced Algorithms", due: "in 2 days", progress: 80 },
  { title: "Lab Report: Duality", course: "Quantum Physics 101", due: "in 4 days", progress: 40 },
  { title: "Final Project Proposal", course: "HCI", due: "in 1 week", progress: 10 },
];

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState("Student");
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fullName = user.displayName || "Alex Doe";
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);
      }
    });
    return () => unsubscribe();
  }, [auth]);

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
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">View your courses and materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Assignments due this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">New announcements and grades</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Stay on top of your assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {upcomingDeadlines.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold">{item.title} <span className="text-muted-foreground font-normal">- {item.course}</span></h3>
                  <span className="text-sm text-muted-foreground">{item.due}</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
          <CardDescription>A quick look at your latest results.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Midterm Exam</TableCell>
                <TableCell>Art History</TableCell>
                <TableCell className="text-right font-medium">A- (91%)</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>Problem Set 2</TableCell>
                <TableCell>Advanced Algorithms</TableCell>
                <TableCell className="text-right font-medium">B+ (88%)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
