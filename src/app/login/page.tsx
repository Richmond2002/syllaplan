
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
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ADMIN_EMAIL = "admin@gmail.com";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });

      if (userCredential.user.email === ADMIN_EMAIL) {
        router.push("/admin");
      } else if (role === "student") {
        router.push("/student");
      } else {
        router.push("/lecturer");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: error.message,
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
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
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
    </Tabs>
  );
}
