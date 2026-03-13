import { useState, useMemo } from "react";
import { useAppData, TimetableEntry } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["9:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "1:00 - 2:00", "2:00 - 3:00"];

const CELL_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-amber-50 border-amber-200",
  "bg-rose-50 border-rose-200",
  "bg-violet-50 border-violet-200",
  "bg-cyan-50 border-cyan-200",
  "bg-orange-50 border-orange-200",
];

function getSubjectColor(subject: string, allSubjects: string[]): string {
  const idx = allSubjects.indexOf(subject);
  return CELL_COLORS[idx % CELL_COLORS.length];
}

const TimetablesPage = () => {
  const { classes, faculty, subjects, classrooms, timetableEntries, setTimetableEntries, lastSaved } = useAppData();
  const [viewMode, setViewMode] = useState<"class" | "faculty">("class");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectNames = useMemo(() => subjects.map((s) => s.name), [subjects]);

  const filteredEntries = useMemo(() => {
    if (viewMode === "class" && selectedClassId) {
      return timetableEntries.filter((e) => e.classId === selectedClassId);
    }
    if (viewMode === "faculty" && selectedFacultyId) {
      const fac = faculty.find((f) => f.id === selectedFacultyId);
      if (!fac) return [];
      return timetableEntries.filter((e) => e.faculty === fac.name);
    }
    return [];
  }, [timetableEntries, viewMode, selectedClassId, selectedFacultyId, faculty]);

  const getEntry = (day: string, slot: string) => filteredEntries.find((e) => e.day === day && e.timeSlot === slot);

  const generateTimetable = () => {
    if (classes.length === 0 || faculty.length === 0 || subjects.length === 0 || classrooms.length === 0) {
      setError("Please add at least one class, faculty, subject, and classroom before generating.");
      return;
    }
    setGenerating(true);
    setError(null);

    setTimeout(() => {
      try {
        const allEntries: TimetableEntry[] = [];
        // Track occupancy: key = `${day}-${slot}` -> Set of faculty names and room names
        const facultyOccupancy: Record<string, Set<string>> = {};
        const roomOccupancy: Record<string, Set<string>> = {};

        for (const day of DAYS) {
          for (const slot of TIME_SLOTS) {
            const key = `${day}-${slot}`;
            facultyOccupancy[key] = new Set();
            roomOccupancy[key] = new Set();
          }
        }

        // Load existing entries into occupancy maps
        const existingOtherEntries = timetableEntries.filter(
          (e) => !classes.some((c) => c.id === e.classId) // keep entries for classes not in current list
        );

        for (const cls of classes) {
          const classEntries: TimetableEntry[] = [];
          let subjectIdx = 0;

          for (const day of DAYS) {
            for (const slot of TIME_SLOTS) {
              const key = `${day}-${slot}`;
              let assigned = false;
              let attempts = 0;
              const maxAttempts = faculty.length * classrooms.length * subjects.length;

              while (!assigned && attempts < maxAttempts) {
                const sub = subjects[subjectIdx % subjects.length];
                const fac = faculty[Math.floor(Math.random() * faculty.length)];
                const room = classrooms[Math.floor(Math.random() * classrooms.length)];

                if (!facultyOccupancy[key].has(fac.name) && !roomOccupancy[key].has(room.name)) {
                  facultyOccupancy[key].add(fac.name);
                  roomOccupancy[key].add(room.name);

                  classEntries.push({
                    id: Math.random().toString(36).substring(2, 11),
                    classId: cls.id,
                    day,
                    timeSlot: slot,
                    subject: sub.name,
                    faculty: fac.name,
                    classroom: room.name,
                  });
                  assigned = true;
                  subjectIdx++;
                }
                attempts++;
              }

              if (!assigned) {
                setError(`Could not assign a conflict-free slot for ${cls.name} on ${day} at ${slot}. Try adding more faculty or rooms.`);
                setGenerating(false);
                return;
              }
            }
          }
          allEntries.push(...classEntries);
        }

        setTimetableEntries([...existingOtherEntries, ...allEntries]);
        toast.success("Timetable generated and saved successfully!");
      } catch {
        setError("An unexpected error occurred during generation.");
      }
      setGenerating(false);
    }, 500);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Timetables</h1>
          {lastSaved && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-success" /> Last saved: {lastSaved}
            </p>
          )}
        </div>
        <Button onClick={generateTimetable} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarDays className="h-4 w-4 mr-2" />}
          {generating ? "Generating..." : "Generate All Timetables"}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4 flex items-start gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls */}
      <div className="bg-card border rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="min-w-[160px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">View By</label>
          <Select value={viewMode} onValueChange={(v: "class" | "faculty") => setViewMode(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {viewMode === "class" && (
          <div className="min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Class</label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger><SelectValue placeholder="Choose a class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {viewMode === "faculty" && (
          <div className="min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Faculty</label>
            <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
              <SelectTrigger><SelectValue placeholder="Choose faculty" /></SelectTrigger>
              <SelectContent>
                {faculty.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Timetable Grid */}
      {((viewMode === "class" && selectedClassId) || (viewMode === "faculty" && selectedFacultyId)) ? (
        <div className="bg-card border rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium w-24">Day</th>
                {TIME_SLOTS.map((slot) => (
                  <th key={slot} className="px-3 py-3 text-center text-muted-foreground font-medium">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day} className="border-t">
                  <td className="px-4 py-3 font-medium text-foreground">{day}</td>
                  {TIME_SLOTS.map((slot) => {
                    const entry = getEntry(day, slot);
                    return (
                      <td key={slot} className="px-2 py-2">
                        {entry ? (
                          <div className={`rounded-md border p-2.5 ${getSubjectColor(entry.subject, subjectNames)}`}>
                            <p className="font-semibold text-foreground text-xs leading-tight">{entry.subject}</p>
                            <p className="text-muted-foreground text-[11px] mt-1">{entry.faculty}</p>
                            <p className="text-muted-foreground text-[11px]">{entry.classroom}</p>
                            {viewMode === "faculty" && (
                              <p className="text-primary text-[11px] font-medium mt-0.5">
                                {classes.find((c) => c.id === entry.classId)?.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-md border border-dashed p-2.5 text-center text-muted-foreground text-xs">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-12 text-center text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a {viewMode} to view the timetable.</p>
        </div>
      )}
    </div>
  );
};

export default TimetablesPage;
