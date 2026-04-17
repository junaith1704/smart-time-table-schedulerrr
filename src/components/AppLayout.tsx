import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const { role } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 shrink-0 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm font-semibold text-foreground">Smart Timetable Scheduler</span>
            {role && (
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase tracking-wide">
                {role}
              </span>
            )}
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
