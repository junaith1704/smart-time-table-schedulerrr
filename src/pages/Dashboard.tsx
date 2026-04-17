import { useClasses, useFaculty, useSubjects, useClassrooms } from "@/hooks/useTimetableData";
import { GraduationCap, Users, BookOpen, DoorOpen, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: classes = [] } = useClasses();
  const { data: faculty = [] } = useFaculty();
  const { data: subjects = [] } = useSubjects();
  const { data: classrooms = [] } = useClassrooms();

  const metrics = [
    { label: "Total Classes", value: classes.length, icon: GraduationCap, color: "from-blue-500 to-blue-600" },
    { label: "Total Faculty", value: faculty.length, icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: "Total Subjects", value: subjects.length, icon: BookOpen, color: "from-amber-500 to-amber-600" },
    { label: "Total Rooms", value: classrooms.length, icon: DoorOpen, color: "from-rose-500 to-rose-600" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${m.color} text-white shadow-sm`}>
                <m.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-3xl font-bold mt-1">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Quick Start</h2>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Add classes, subjects, classrooms, and faculty</li>
            <li>Map each faculty member to the subjects they can teach</li>
            <li>Generate the weekly timetable</li>
            <li>Export to PDF or share with teachers</li>
          </ol>
        </div>
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-2">Smart Scheduling</h2>
          <p className="text-sm opacity-90">
            The generator respects subject mappings, hourly limits, and prevents back-to-back classes for the same teacher.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
