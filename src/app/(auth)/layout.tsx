
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111827] p-6">
       <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
