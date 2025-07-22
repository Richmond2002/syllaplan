
"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookCopy, CalendarClock, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingLectures = [
  { course: "Advanced Algorithms", topic: "Dynamic Programming", time: "Tomorrow, 10:00 AM", location: "Room 301" },
  { course: "Quantum Physics 101", topic: "Wave-particle Duality", time: "Tomorrow, 2:00 PM", location: "Physics Hall A" },
  { course: "Intro to AI", topic: "Search Algorithms", time: "Wednesday, 9:00 AM", location: "Online" },
];

export default function LecturerDashboardPage() {
  const [userName, setUserName] = useState("Lecturer");
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fullName = user.displayName || "Dr. Chen";
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);
      }
    });
    return () => unsubscribe();
  }, [auth]);

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
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Active courses this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lectures</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments to Grade</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
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
              {upcomingLectures.map((lecture, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{lecture.course}</TableCell>
                  <TableCell>{lecture.topic}</TableCell>
                  <TableCell>{lecture.time}</TableCell>
                  <TableCell>
                    <Badge variant={lecture.location === "Online" ? "default" : "secondary"}>
                      {lecture.location}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
