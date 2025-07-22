import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, GraduationCap, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Total Lecturers",
    value: "78",
    change: "+12.5%",
    icon: Users,
  },
  {
    title: "Total Courses",
    value: "125",
    change: "+5",
    icon: BookOpen,
  },
  {
    title: "Active Students",
    value: "1,234",
    change: "+82",
    icon: GraduationCap,
  },
];

const recentActivities = [
  { id: 1, user: "Dr. Evelyn Reed", action: "created a new course", subject: "Quantum Physics 101", timestamp: "5 minutes ago" },
  { id: 2, user: "Admin", action: "approved a new lecturer account", subject: "Dr. Samuel Chen", timestamp: "1 hour ago" },
  { id: 3, user: "System", action: "generated a platform usage report", subject: "Monthly Report", timestamp: "3 hours ago" },
  { id: 4, user: "Dr. Isabella Rossi", action: "updated syllabus for", subject: "Art History", timestamp: "1 day ago" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
