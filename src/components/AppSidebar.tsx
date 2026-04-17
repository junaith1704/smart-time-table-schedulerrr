import { LayoutDashboard, Users, BookOpen, DoorOpen, GraduationCap, CalendarDays, LogOut, Calendar } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const adminItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "Classes", url: "/classes", icon: GraduationCap },
  { title: "Faculty", url: "/faculty", icon: Users },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Rooms", url: "/rooms", icon: DoorOpen },
  { title: "Timetables", url: "/timetables", icon: CalendarDays },
];

const teacherItems = [
  { title: "My Timetable", url: "/my-timetable", icon: Calendar, end: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, user, signOut } = useAuth();
  const navigate = useNavigate();

  const items = role === "admin" ? adminItems : teacherItems;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5 border-b">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">TimetablePro</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{role}</p>
              </div>
            </div>
          ) : (
            <CalendarDays className="h-5 w-5 text-primary mx-auto" />
          )}
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground truncate mb-2 px-1">{user.email}</p>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
