"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
}
