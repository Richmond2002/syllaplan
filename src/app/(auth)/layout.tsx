
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-end bg-background p-4 sm:p-8 lg:p-16">
      {/* This inner div is now flexed to the right by the parent */}
      {children}
    </div>
  );
}
