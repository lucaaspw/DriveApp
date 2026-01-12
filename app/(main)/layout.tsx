import { BottomNavigation } from "@/components/BottomNavigation";
import { SidebarNavigation } from "@/components/SidebarNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <SidebarNavigation />
      <div className="md:ml-64">
        <div className="fixed top-4 right-4 md:right-8 z-50">
          <ThemeToggle />
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {children}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
