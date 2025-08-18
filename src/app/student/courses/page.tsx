
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookMarked, Loader2 } from "lucide-react";
import Link from "next/link";
import { getFirestore, collection, getDocs, doc, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

interface Course {
  id: string;
  title: string;
  code: string;
  lecturerName: string;
  description: string;
}

export default function StudentCoursesPage() {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const fetchEnrolledCourses = useCallback(async (user: User) => {
    setIsLoading(true);
    try {
      const enrolledCourseIds: string[] = [];
      const coursesQuerySnapshot = await getDocs(collection(db, "courses"));
      
      for (const courseDoc of coursesQuerySnapshot.docs) {
        const enrollmentQuery = query(collection(db, `courses/${courseDoc.id}/enrolledStudents`), where("uid", "==", user.uid));
        const enrollmentSnapshot = await getDocs(enrollmentQuery);
        if (!enrollmentSnapshot.empty) {
            enrolledCourseIds.push(courseDoc.id);
        }
      }

      if (enrolledCourseIds.length > 0) {
        const coursesQuery = query(collection(db, "courses"), where("__name__", "in", enrolledCourseIds));
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Course[];
        setMyCourses(coursesData);
      } else {
        setMyCourses([]);
      }

    } catch (error) {
      console.error("Error fetching enrolled courses: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchEnrolledCourses(user);
      } else {
        setIsLoading(false);
        setMyCourses([]);
      }
    });
    return () => unsubscribe();
  }, [auth, fetchEnrolledCourses]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Courses</h1>
        <p className="text-muted-foreground">All your enrolled courses for the current semester.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : myCourses.length === 0 ? (
        <Card className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
              <p className="font-semibold">No courses found.</p>
              <p className="text-sm">You are not enrolled in any courses yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {myCourses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                  <CardTitle className="font-headline text-2xl">{course.title}</CardTitle>
                  <CardDescription>{course.code}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">Taught by {course.lecturerName}</p>
                  <p className="text-sm text-foreground/80">{course.description || "No description provided."}</p>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                  <Button className="w-full" asChild>
                      <Link href={`/student/courses/${course.code.toLowerCase()}`}>
                          <BookMarked className="mr-2 h-4 w-4" /> Go to Course
                      </Link>
                  </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
