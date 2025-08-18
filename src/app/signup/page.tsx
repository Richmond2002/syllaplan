
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, serverTimestamp, query, where, getDocs, writeBatch } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, User, Building, Mail, Lock } from "lucide-react";

const HIDDEN_EMAIL_DOMAIN = "courseforge.app";

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
    
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const displayName = fullName.trim();

    let email = "";
    let indexNumber = "";

    try {
      if (role === 'student') {
        indexNumber = (form.elements.namedItem("indexNumber") as HTMLInputElement).value.toUpperCase();
        email = `${indexNumber.replace(/\//g, '-')}@${HIDDEN_EMAIL_DOMAIN}`;
      } else { // Lecturer
        email = (form.elements.namedItem("email") as HTMLInputElement).value;
      }

      // Check if user or student already exists before creating auth user
      const userQuery = query(collection(db, "users"), where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        throw new Error("This email or index number is already registered.");
      }

      if (role === 'student') {
        const studentQuery = query(collection(db, "students"), where("indexNumber", "==", indexNumber));
        const studentSnapshot = await getDocs(studentQuery);
        if (!studentSnapshot.empty) {
            throw new Error("This index number is already registered.");
        }
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        await updateProfile(user, { displayName });

        const batch = writeBatch(db);

        // 1. Create user role document using the canonical email from the created user
        const userDocRef = doc(db, "users", user.email!);
        batch.set(userDocRef, {
          uid: user.uid,
          email: user.email,
          role: role,
          ...(role === 'student' && { indexNumber: indexNumber }),
        });

        // 2. Create student or lecturer profile document
        if (role === 'student') {
            const department = indexNumber.split('/')[0];
            const program = indexNumber.split('/')[1];
            const yearSuffix = indexNumber.split('/')[2];
            const enrollmentYear = `20${yearSuffix}`;
            const studentDocRef = doc(collection(db, "students"));
            batch.set(studentDocRef, {
                uid: user.uid,
                name: displayName,
                email: user.email, // Use canonical email
                department,
                program,
                enrollmentYear,
                indexNumber,
                createdAt: serverTimestamp(),
            });
        } else if (role === 'lecturer') {
            const department = (form.elements.namedItem("department") as HTMLInputElement).value;
            const lecturerDocRef = doc(collection(db, "lecturers"));
            batch.set(lecturerDocRef, {
                uid: user.uid,
                name: displayName,
                email: user.email, // Use canonical email
                department: department || "Not Assigned",
                courses: 0,
                status: "Active",
                createdAt: serverTimestamp(),
            });
        }
        
        await batch.commit();
      }

      toast({
        title: "Account Created!",
        description: "Redirecting to your dashboard...",
      });
      router.push(role === "student" ? "/student" : "/lecturer");

    } catch (error: any) {
      console.error("Signup Error:", error);
      let description = error.message || "An unexpected error occurred. Please try again.";
      if (error.code === "auth/email-already-in-use" || description.includes("already registered")) {
        description = "This email or index number is already in use by another account.";
      } else if (error.code === "auth/weak-password") {
        description = "Password is too weak. Please choose a stronger password.";
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
        <p className="text-gray-600">Join SyllaPlan to get started</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="p-8">
          <Tabs defaultValue="student" value={role} onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">I'm a Student</TabsTrigger>
                <TabsTrigger value="lecturer">I'm a Lecturer</TabsTrigger>
            </TabsList>
          
            <form onSubmit={handleSignup} className="space-y-6 mt-8">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                   <input id="fullName" name="fullName" placeholder="John Doe" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none" />
                </div>
              </div>
             
              {role === 'student' ? (
                <div className="space-y-2">
                    <label htmlFor="indexNumber" className="text-sm font-medium text-gray-700">Index Number</label>
                     <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input id="indexNumber" name="indexNumber" placeholder="PS/ITC/21/0001" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none" />
                    </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input id="email" name="email" type="email" placeholder="you@example.com" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="department" className="text-sm font-medium text-gray-700">Department</label>
                     <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input id="department" name="department" placeholder="e.g. Computer Science" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input id="password" name="password" type="password" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none" />
                </div>
              </div>
              
              <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                {isLoading ? <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Up...</div> : "Create Account"}
              </button>
            </form>
          </Tabs>

          <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500">OR</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Log In
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
