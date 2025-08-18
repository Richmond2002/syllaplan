
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let email = identifier;
    // Check if the identifier looks like an index number
    if (identifier.includes('/') && !identifier.includes('@')) {
      email = `${identifier.toUpperCase().replace(/\//g, '-')}@${HIDDEN_EMAIL_DOMAIN}`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Determine user role and redirect
      const userDocRef = doc(db, "users", user.email!);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        if (userData.role === 'admin') {
          router.push("/admin");
        } else if (userData.role === 'lecturer') {
          router.push("/lecturer");
        } else {
          router.push("/student");
        }
      } else {
         throw new Error("User role not found.");
      }
    } catch (error: any) {
        console.error("Login error:", error);
        let errorMessage = "Invalid credentials. Please check your email/index number and password.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = "Invalid credentials. Please try again.";
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
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome Back</h1>
        <p className="text-gray-600 dark:text-gray-300">Sign in to access your account</p>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email/Index Number Field */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Index Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="identifier"
                  name="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or PS/ITC/21/0001"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || !identifier || !password}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">New here?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <Link
              href="/signup"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
