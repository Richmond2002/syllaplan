
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { app } from "@/lib/firebase/client";
import { useState, useEffect } from "react";
import { Loader2, User, Mail, GraduationCap, BookOpen, Bell, Shield, Languages } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const enrolledCourses = [
  { code: "CS203", title: "Advanced Algorithms" },
  { code: "PHY101", title: "Quantum Physics 101" },
  { code: "CS374", title: "Human-Computer Interaction" },
  { code: "ARH300", title: "Renaissance Art History" },
];

const loginHistory = [
    { date: "2024-07-28 09:45 AM", ip: "192.168.1.2", device: "Chrome on Windows" },
    { date: "2024-07-26 08:00 PM", ip: "10.0.0.8", device: "Firefox on Linux" },
]

export default function StudentProfilePage() {
  const auth = getAuth(app);
  const { toast } = useToast();
  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setDisplayName(user.displayName || "Alex Doe");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      await updateProfile(user, { displayName });
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
     if (password.length < 6) {
       toast({
        title: "Error",
        description: "Password should be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(user, password);
      toast({ title: "Success", description: "Password updated successfully." });
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account details, preferences, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src="https://placehold.co/100x100.png" alt={displayName} data-ai-hint="profile avatar" />
                        <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-headline font-semibold">{displayName}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-2" variant="secondary">Student</Badge>
                    <Button variant="outline" size="sm" className="mt-4">Edit Profile Picture</Button>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your display name and contact info.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={user?.email || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="program">Enrolled Program</Label>
                            <Input id="program" defaultValue="B.Sc. Computer Science" />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>

       <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <CardTitle>Enrolled Courses</CardTitle>
                </div>
                <CardDescription>Courses you are currently enrolled in.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {enrolledCourses.map(course => (
                        <li key={course.code} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <span className="font-medium">{course.title}</span>
                            <Badge variant="outline">{course.code}</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your password, language, and notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold">Change Password</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                </div>
                 <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Change Password
                 </Button>
            </form>

            <div className="p-4 border rounded-md space-y-4">
                 <h3 className="font-semibold">Preferences</h3>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="language" className="flex items-center"><Languages className="mr-2 h-4 w-4" /> Language</Label>
                        <p className="text-xs text-muted-foreground">Choose your preferred language.</p>
                    </div>
                    <Select defaultValue="en">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <Separator />
                <div className="space-y-2">
                     <Label className="flex items-center"><Bell className="mr-2 h-4 w-4" /> Notification Settings</Label>
                     <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Receive email for new grades.</p>
                        <Switch id="notification-grades" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Receive reminders for upcoming deadlines.</p>
                        <Switch id="notification-deadlines" defaultChecked />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Review your recent login activity.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Device / Browser</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loginHistory.map((login, index) => (
                        <TableRow key={index}>
                            <TableCell>{login.date}</TableCell>
                            <TableCell className="font-mono">{login.ip}</TableCell>
                            <TableCell>{login.device}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
