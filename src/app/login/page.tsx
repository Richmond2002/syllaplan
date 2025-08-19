
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, GraduationCap, Mail, Lock } from "lucide-react";

const HIDDEN_EMAIL_DOMAIN = "courseforge.app";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, redirect them to their dashboard
        const userDocRef = doc(db, "users", user.email!);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const { role } = userDoc.data();
          if (role === 'admin') router.push('/admin');
          else if (role === 'lecturer') router.push('/lecturer');
          else router.push('/student');
        }
      }
    });
    return () => unsubscribe();
  }, [auth, db, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let emailToAuth = identifier;
    if (identifier.includes('/') && !identifier.includes('@')) {
      emailToAuth = `${identifier.toUpperCase().replace(/\//g, '-')}@${HIDDEN_EMAIL_DOMAIN}`;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, emailToAuth, password);
      const user = userCredential.user;

      // Guaranteed Admin Path
      if (user.email === 'admin@gmail.com') {
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            role: 'admin',
          });
        }
        toast({ title: "Admin Login Successful", description: "Redirecting to dashboard..." });
        router.push("/admin");
        return;
      }

      const userDocRef = doc(db, "users", user.email!);
      let userDoc = await getDoc(userDocRef);

      // This block handles fixing older accounts that are missing a user role doc
      if (!userDoc.exists()) {
        const role = user.email?.endsWith(HIDDEN_EMAIL_DOMAIN) ? 'student' : 'lecturer';
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          role: role,
        });
        userDoc = await getDoc(userDocRef); // Re-fetch the doc after creating it
      }
      
      const userData = userDoc.data();
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });

      if (userData?.role === 'lecturer') {
        router.push("/lecturer");
      } else if (userData?.role === 'student') {
        router.push("/student");
      } else {
         // Fallback just in case
         throw new Error("Could not determine user role for redirection.");
      }

    } catch (error: any) {
        console.error("Login error:", error);
        let errorMessage = "Invalid credentials. Please check your email/index number and password.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = "Invalid credentials. Please try again.";
        } else if (error.message.includes("User role not found")) {
            errorMessage = "Could not find account details. Please contact support.";
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to access your account</p>
      </div>

      <div className="bg-card shadow-xl rounded-2xl border">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Sign In
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium text-foreground">
                Email or Index Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="identifier"
                  name="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or PS/ITC/21/0001"
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors outline-none bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors outline-none bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier || !password}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">New here?</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <Link
              href="/signup"
              className="text-sm font-medium text-primary hover:underline transition-colors"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
