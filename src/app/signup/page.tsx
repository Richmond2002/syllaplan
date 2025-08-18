
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value;
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    
    const displayName = `${firstName} ${lastName}`.trim();

    try {
      // Check if user with this email already exists in the central users collection
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        throw new Error("auth/email-already-in-use");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        await updateProfile(user, { displayName });

        // Create a record in the central 'users' collection for role management
        await setDoc(doc(db, "users", email), {
          uid: user.uid,
          email: user.email,
          role: role,
        });

        // Create a role-specific record
        if (role === 'student') {
          const department = (form.elements.namedItem("department") as HTMLInputElement).value;
          const program = (form.elements.namedItem("program") as HTMLInputElement).value;
          const year = (form.elements.namedItem("year") as HTMLInputElement).value;
          
          const yearAbbr = year.substring(2);

          const studentCounterRef = doc(db, "counters", "students");

          const newIndexNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(studentCounterRef);
            let newCount = 1;
            if (counterDoc.exists()) {
              newCount = counterDoc.data().count + 1;
            }
            transaction.set(studentCounterRef, { count: newCount }, { merge: true });

            const paddedId = newCount.toString().padStart(4, '0');
            return `${department.toUpperCase()}/${program.toUpperCase()}/${yearAbbr}/${paddedId}`;
          });

          const currentYear = new Date().getFullYear();
          const enrollmentYear = parseInt(year, 10);
          const level = (currentYear - enrollmentYear) * 100 + 100;


          await addDoc(collection(db, "students"), {
            uid: user.uid,
            name: displayName,
            email: user.email,
            department: department.toUpperCase(),
            program: program.toUpperCase(),
            enrollmentYear: enrollmentYear,
            level: level > 400 ? 400 : level, // Cap level at 400
            indexNumber: newIndexNumber,
            createdAt: serverTimestamp(),
          });

        } else if (role === 'lecturer') {
            await addDoc(collection(db, "lecturers"), {
                uid: user.uid,
                name: displayName,
                email: user.email,
                department: "Not Assigned", // Default department, admin can change
                courses: 0,
                status: "Active",
                createdAt: serverTimestamp(),
            });
        }
      }

      toast({
        title: "Account Created!",
        description: "Redirecting to your dashboard...",
      });
      if (role === "student") {
        router.push("/student");
      } else {
        router.push("/lecturer");
      }
    } catch (error: any) {
      console.error(error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === "auth/email-already-in-use" || error.message === "auth/email-already-in-use") {
        description = "This email address is already in use by another account.";
      }
      toast({
        title: "Signup Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="student" value={role} onValueChange={setRole} className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
        </TabsList>
        <Card className="border-t-0 rounded-t-none">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
            <CardDescription>Start your journey with SyllaPlan today.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              
              {role === 'student' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" name="department" placeholder="e.g. PS" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="program">Program</Label>
                            <Input id="program" name="program" placeholder="e.g. ITC" required />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="year">Enrollment Year</Label>
                        <Select name="year" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                            <SelectItem value="2021">2021</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                </>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center text-sm">
            <p className="text-muted-foreground">
                Already have an account?&nbsp;
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Log In
                </Link>
            </p>
          </CardFooter>
        </Card>
    </Tabs>
  );
}
