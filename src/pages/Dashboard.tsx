import { useAppData } from "@/store/AppContext";
import { GraduationCap, Users, BookOpen, DoorOpen } from "lucide-react";

const Dashboard = () => {
  const { classes, faculty, subjects, classrooms } = useAppData();

  const metrics = [
    { label: "Classes", value: classes.length, icon: GraduationCap, color: "text-primary" },
    { label: "Faculty", value: faculty.length, icon: Users, color: "text-success" },
    { label: "Subjects", value: subjects.length, icon: BookOpen, color: "text-amber-500" },
    { label: "Classrooms", value: classrooms.length, icon: DoorOpen, color: "text-destructive" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card rounded-lg border p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${m.color}`}>
              <m.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-3xl font-bold">{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
