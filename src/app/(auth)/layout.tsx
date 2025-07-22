import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
      <Link href="/" className="flex items-center gap-2 font-bold mb-8">
        <svg
          className="size-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        <h1 className="font-headline text-2xl font-semibold">CourseForge</h1>
      </Link>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
