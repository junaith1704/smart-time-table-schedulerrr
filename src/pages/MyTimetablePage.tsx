import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFaculty, useTimetableEntries, useClasses } from "@/hooks/useTimetableData";
import { Button } from "@/components/ui/button";
import { Calendar, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { exportTimetablePDF } from "@/lib/pdfExport";
import { DAYS, TIME_SLOTS } from "@/lib/scheduler";

const SUBJECT_PALETTE = [
  "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-100",
  "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100",
  "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100",
  "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100",
  "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-100",
  "bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-100",
];
const colorFor = (name: string) => {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SUBJECT_PALETTE[h % SUBJECT_PALETTE.length];
};

const MyTimetablePage = () => {
  const { user } = useAuth();
  const { data: faculty = [] } = useFaculty();
  const { data: entries = [] } = useTimetableEntries();
  const { data: classes = [] } = useClasses();

  const myFaculty = useMemo(() => {
    return faculty.find((f) => f.auth_user_id === user?.id) ?? faculty.find((f) => f.email === user?.email);
  }, [faculty, user]);

  const myEntries = useMemo(() => {
    if (!myFaculty) return [];
    return entries.filter((e) => e.faculty_id === myFaculty.id);
  }, [entries, myFaculty]);

  const getEntry = (day: string, slot: string) => myEntries.find((e) => e.day === day && e.time_slot === slot);

  const handleExport = () => {
    if (myEntries.length === 0) { toast.error("Nothing to export yet"); return; }
    exportTimetablePDF(`Timetable - ${myFaculty?.name}`, myEntries);
    toast.success("PDF exported");
  };

  if (!myFaculty) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></div>
          <h1 className="text-2xl font-bold">My Timetable</h1>
        </div>
        <div className="bg-card border rounded-xl p-8 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <h2 className="font-semibold mb-1">No faculty record linked yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Ask your administrator to add a faculty record with your email <strong>{user?.email}</strong>.
            Once linked, your weekly schedule will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold">My Timetable</h1>
            <p className="text-sm text-muted-foreground">{myFaculty.name} · {myFaculty.department}</p>
          </div>
        </div>
        {myEntries.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />Export PDF
          </Button>
        )}
      </div>

      {myEntries.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground shadow-sm">
          <Calendar className="h-10 w-10 mx-auto opacity-30 mb-3" />
          <p>No classes scheduled yet. The admin needs to generate a timetable.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium w-28">Day</th>
                {TIME_SLOTS.map((slot) => (
                  <th key={slot} className="px-3 py-3 text-center text-muted-foreground font-medium">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day} className="border-t">
                  <td className="px-4 py-3 font-semibold">{day}</td>
                  {TIME_SLOTS.map((slot) => {
                    const e = getEntry(day, slot);
                    return (
                      <td key={slot} className="px-2 py-2">
                        {e ? (
                          <div className={`rounded-lg border p-2.5 ${colorFor(e.subject_name)}`}>
                            <p className="font-semibold text-xs leading-tight">{e.subject_name}</p>
                            <p className="text-[11px] opacity-75 mt-1">{classes.find((c) => c.id === e.class_id)?.name}</p>
                            <p className="text-[11px] opacity-75">{e.classroom_name}</p>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed p-2.5 text-center text-muted-foreground text-xs">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyTimetablePage;
