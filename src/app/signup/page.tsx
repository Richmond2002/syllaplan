
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [role, setRole] = useState("student");
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "student") {
      router.push("/student");
    } else {
      router.push("/lecturer");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
        <CardDescription>Start your journey with CourseForge today.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
           <div className="space-y-2">
            <Label>Sign up as a...</Label>
            <RadioGroup defaultValue="student" value={role} onValueChange={setRole} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lecturer" id="lecturer" />
                <Label htmlFor="lecturer">Lecturer</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full">
            Create Account
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
  );
}
