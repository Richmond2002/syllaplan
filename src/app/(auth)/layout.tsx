
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-end bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 lg:p-16">
      {/* This inner div is now flexed to the right by the parent */}
      {children}
    </div>
  );
}
