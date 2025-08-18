
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;
    let email = "";

    try {
      // Check if identifier is an email or index number
      const isEmail = identifier.includes("@");

      if (isEmail) {
        email = identifier;
      } else {
        // It's an index number, find the student's email
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("indexNumber", "==", identifier.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("auth/user-not-found");
        }
        const studentData = querySnapshot.docs[0].data();
        email = studentData.email;
      }

      // Proceed with authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });

      // Special case for admin
      if (userCredential.user.email === ADMIN_EMAIL) {
        router.push("/admin");
        return;
      }

      // Fetch user role for redirection
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
         throw new Error("Could not determine user role.");
      }
      
    } catch (error: any) {
      console.error(error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = "Invalid credentials. Please check your details and try again.";
      } else if (error.message.includes("auth/user-not-found")) {
          errorMessage = "No account found with that email or index number.";
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="identifier">Email or Index Number</Label>
                <Input
                id="identifier"
                name="identifier"
                placeholder="e.g., you@example.com or PS/ITC/21/0001"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
            </Button>
        </form>
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
  );
}
