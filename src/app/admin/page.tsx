
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, GraduationCap, ArrowUpRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase/client";

const recentActivities = [
  { id: 1, user: "Dr. Evelyn Reed", action: "created a new course", subject: "Quantum Physics 101", timestamp: "5 minutes ago" },
  { id: 2, user: "Admin", action: "approved a new lecturer account", subject: "Dr. Samuel Chen", timestamp: "1 hour ago" },
  { id: 3, user: "System", action: "generated a platform usage report", subject: "Monthly Report", timestamp: "3 hours ago" },
  { id: 4, user: "Dr. Isabella Rossi", action: "updated syllabus for", subject: "Art History", timestamp: "1 day ago" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    lecturers: 0,
    courses: 0,
    students: 1234, // Static for now
  });
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const lecturersSnapshot = await getDocs(collection(db, "lecturers"));
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        
        setStats(prevStats => ({
          ...prevStats,
          lecturers: lecturersSnapshot.size,
          courses: coursesSnapshot.size, 
        }));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [db]);


  const statCards = [
    {
      title: "Total Lecturers",
      value: stats.lecturers,
      change: "+12.5%", // Static for now
      icon: Users,
    },
    {
      title: "Total Courses",
      value: stats.courses,
      change: "+5", // Static for now
      icon: BookOpen,
    },
    {
      title: "Active Students",
      value: stats.students.toLocaleString(),
      change: "+82", // Static for now
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                {stat.change} this month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>A log of recent important actions across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.user}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="mr-2">{activity.action}</Badge>
                  </TableCell>
                  <TableCell>{activity.subject}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{activity.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
