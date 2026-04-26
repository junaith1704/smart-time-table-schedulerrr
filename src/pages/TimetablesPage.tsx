import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useClasses, useFaculty, useSubjects, useClassrooms,
  useTimetableEntries,
} from "@/hooks/useTimetableData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2, AlertTriangle, Download, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DAYS, TIME_SLOTS } from "@/lib/scheduler";
import { exportTimetablePDF, exportAllClassesPDF } from "@/lib/pdfExport";

const SUBJECT_PALETTE = [
  "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-100",
  "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100",
  "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100",
  "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100",
  "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-100",
  "bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-100",
  "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-100",
];

const colorFor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
};

const TimetablesPage = () => {
  const { data: classes = [] } = useClasses();
  const { data: faculty = [] } = useFaculty();
  const { data: subjects = [] } = useSubjects();
  const { data: classrooms = [] } = useClassrooms();
  const { data: facultySubjects = [] } = useFacultySubjects();
  const { data: entries = [] } = useTimetableEntries();
  const replaceEntries = useReplaceTimetableEntries();

  const [viewMode, setViewMode] = useState<"class" | "faculty">("class");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (viewMode === "class" && selectedClassId) {
      return entries.filter((e) => e.class_id === selectedClassId);
    }
    if (viewMode === "faculty" && selectedFacultyId) {
      return entries.filter((e) => e.faculty_id === selectedFacultyId);
    }
    return [];
  }, [entries, viewMode, selectedClassId, selectedFacultyId]);

  const getEntry = (day: string, slot: string) => filtered.find((e) => e.day === day && e.time_slot === slot);

  const handleGenerate = async () => {
    setGenerating(true);
    setWarnings([]);
    await new Promise((r) => setTimeout(r, 350));

    const schedFaculty = faculty.map((f) => ({
      id: f.id,
      name: f.name,
      max_hours_per_week: f.max_hours_per_week,
      max_classes_per_day: f.max_classes_per_day,
      subjectIds: facultySubjects.filter((m) => m.faculty_id === f.id).map((m) => m.subject_id),
    }));

    const result = generateTimetable(
      classes.map((c) => ({ id: c.id, name: c.name })),
      subjects.map((s) => ({ id: s.id, name: s.name })),
      schedFaculty,
      classrooms.map((r) => ({ id: r.id, name: r.name })),
    );

    if (result.error) {
      toast.error(result.error);
      setGenerating(false);
      return;
    }

    setWarnings(result.warnings);

    replaceEntries.mutate(result.entries, {
      onSuccess: () => {
        toast.success(`Timetable generated — ${result.entries.length} slots filled`);
        if (result.warnings.length > 0) {
          toast.warning(`${result.warnings.length} warnings. Review below.`);
        }
      },
      onSettled: () => setGenerating(false),
    });
  };

  const handleExportCurrent = () => {
    if (filtered.length === 0) { toast.error("Nothing to export"); return; }
    const title = viewMode === "class"
      ? `Timetable - ${classes.find((c) => c.id === selectedClassId)?.name}`
      : `Timetable - ${faculty.find((f) => f.id === selectedFacultyId)?.name}`;
    exportTimetablePDF(title, filtered);
    toast.success("PDF exported");
  };

  const handleExportAll = () => {
    if (classes.length === 0 || entries.length === 0) { toast.error("Generate a timetable first"); return; }
    exportAllClassesPDF(classes.map((c) => ({ id: c.id, name: c.name })), entries);
    toast.success("All-classes PDF exported");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {generating && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-xl p-8 shadow-xl flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-medium">Generating timetable…</p>
            <p className="text-xs text-muted-foreground">Solving constraints</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></div>
          <h1 className="text-2xl font-bold">Timetables</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportAll}>
            <FileText className="h-4 w-4 mr-2" />Export All Classes
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? "Generating…" : "Generate Timetable"}
          </Button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-200 text-sm">
            <AlertTriangle className="h-4 w-4" /> {warnings.length} scheduling warning{warnings.length === 1 ? "" : "s"}
          </div>
          <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc list-inside space-y-0.5 max-h-32 overflow-auto">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-4 items-end shadow-sm">
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
                {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
                {faculty.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {filtered.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportCurrent} className="ml-auto">
            <Download className="h-4 w-4 mr-2" />Export PDF
          </Button>
        )}
      </div>

      {((viewMode === "class" && selectedClassId) || (viewMode === "faculty" && selectedFacultyId)) ? (
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
                    const entry = getEntry(day, slot);
                    return (
                      <td key={slot} className="px-2 py-2">
                        {entry ? (
                          <div className={`rounded-lg border p-2.5 ${colorFor(entry.subject_name)} transition-transform hover:scale-[1.02]`}>
                            <p className="font-semibold text-xs leading-tight">{entry.subject_name}</p>
                            <p className="text-[11px] opacity-75 mt-1">{entry.faculty_name}</p>
                            <p className="text-[11px] opacity-75">{entry.classroom_name}</p>
                            {viewMode === "faculty" && (
                              <p className="text-[11px] font-medium mt-0.5 opacity-90">
                                {classes.find((c) => c.id === entry.class_id)?.name}
                              </p>
                            )}
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
      ) : (
        <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground shadow-sm">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a {viewMode} to view the timetable.</p>
        </div>
      )}
    </div>
  );
};

export default TimetablesPage;
