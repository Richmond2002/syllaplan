
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ADMIN_EMAIL = "admin@gmail.com";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    
    let email = "";
    let password = "";
    
    if (activeTab === "lecturer") {
        email = (form.elements.namedItem("email") as HTMLInputElement).value;
        password = (form.elements.namedItem("password") as HTMLInputElement).value;
    } else {
        const indexNumber = (form.elements.namedItem("indexNumber") as HTMLInputElement).value;
        password = (form.elements.namedItem("password") as HTMLInputElement).value;

        // Find the student's email from their index number
        try {
            const studentsRef = collection(db, "students");
            const q = query(studentsRef, where("indexNumber", "==", indexNumber.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("auth/user-not-found");
            }
            const studentData = querySnapshot.docs[0].data();
            email = studentData.email;
        } catch (error) {
             toast({
                title: "Login Failed",
                description: "No student found with that Index Number.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }
    }


    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });

      if (userCredential.user.email === ADMIN_EMAIL) {
        router.push("/admin");
        return;
      }

      // Fetch user role from 'users' collection using the official email
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'student') {
          router.push("/student");
        } else if (userData.role === 'lecturer') {
          router.push("/lecturer");
        } else {
           throw new Error("User role not found.");
        }
      } else {
        // Fallback for users created before role system, default to lecturer
         toast({
            title: "Error",
            description: "Could not determine user role. Please contact support.",
            variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error(error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = "Invalid credentials. Please check your details and try again.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="student" className="w-full max-w-sm" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
        </TabsList>
        <form onSubmit={handleLogin}>
            <TabsContent value="student">
                <Card className="border-t-0 rounded-t-none">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">Student Login</CardTitle>
                    <CardDescription>Enter your index number and password to access your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="indexNumber">Index Number</Label>
                        <Input id="indexNumber" name="indexNumber" placeholder="e.g. PS/ITC/21/0001" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-student">Password</Label>
                        <Input id="password-student" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center text-sm">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?&nbsp;
                        <Link href="/signup" className="text-primary hover:underline font-medium">
                            Sign Up
                        </Link>
                    </p>
                </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="lecturer">
                 <Card className="border-t-0 rounded-t-none">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl">Lecturer Login</CardTitle>
                        <CardDescription>Enter your email and password to access your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-lecturer">Password</Label>
                        <Input id="password-lecturer" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
                    </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center text-sm">
                        <p className="text-muted-foreground">
                            Don&apos;t have an account?&nbsp;
                            <Link href="/signup" className="text-primary hover:underline font-medium">
                                Sign Up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </TabsContent>
        </form>
    </Tabs>
  );
}
