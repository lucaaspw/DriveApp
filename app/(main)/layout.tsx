import { BottomNavigation } from "@/components/BottomNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
      <BottomNavigation />
    </div>
  );
}
