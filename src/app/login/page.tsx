
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
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
        <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label>I am a...</Label>
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
