
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, Users, BarChart, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  students: number;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  const fetchCourses = useCallback(async (uid: string) => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "courses"), where("lecturerId", "==", uid));
      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses: ", error);
      toast({
        title: "Error",
        description: "Failed to fetch your courses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [db, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchCourses(currentUser.uid);
      } else {
        setIsLoading(false);
        setCourses([]);
      }
    });
    return () => unsubscribe();
  }, [auth, fetchCourses]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Courses</h1>
        <p className="text-muted-foreground">An overview of all courses you are teaching.</p>
      </div>
       {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <Card className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
                <p className="font-semibold">No courses assigned.</p>
                <p className="text-sm">Please contact an admin to be assigned to a course.</p>
            </div>
        </Card>
      ) : (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline text-2xl">{course.title}</CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.students} students</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-foreground/80">{course.description || "No description provided."}</p>
            </CardContent>
            <div className="p-6 pt-0 mt-auto grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                    <Link href="/lecturer/syllabus-generator"><FileEdit className="mr-2 h-4 w-4" /> Edit Syllabus</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="#"><BarChart className="mr-2 h-4 w-4" /> View Analytics</Link>
                </Button>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
