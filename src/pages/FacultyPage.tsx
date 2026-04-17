import { useState } from "react";
import {
  useFaculty, useAddFaculty, useDeleteFaculty,
  useSubjects, useFacultySubjects, useSetFacultySubjects,
} from "@/hooks/useTimetableData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Trash2, Plus, Users, BookCheck, ChevronsUpDown } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const FacultyPage = () => {
  const { data: faculty = [], isLoading } = useFaculty();
  const { data: subjects = [] } = useSubjects();
  const { data: facultySubjects = [] } = useFacultySubjects();
  const addFaculty = useAddFaculty();
  const deleteFaculty = useDeleteFaculty();
  const setMappings = useSetFacultySubjects();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [maxHours, setMaxHours] = useState("20");
  const [maxPerDay, setMaxPerDay] = useState("2");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim() || !department.trim()) return;
    addFaculty.mutate(
      {
        name: name.trim(),
        department: department.trim(),
        email: email.trim() || null,
        max_hours_per_week: parseInt(maxHours) || 20,
        max_classes_per_day: parseInt(maxPerDay) || 2,
      },
      {
        onSuccess: () => {
          setName(""); setDepartment(""); setEmail("");
          setMaxHours("20"); setMaxPerDay("2");
        },
      }
    );
  };

  const subjectsForFaculty = (fid: string) =>
    facultySubjects.filter((m) => m.faculty_id === fid).map((m) => m.subject_id);

  const toggleMapping = (facultyId: string, subjectId: string) => {
    const current = subjectsForFaculty(facultyId);
    const next = current.includes(subjectId)
      ? current.filter((s) => s !== subjectId)
      : [...current, subjectId];
    setMappings.mutate({ facultyId, subjectIds: next });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600"><Users className="h-5 w-5" /></div>
        <h1 className="text-2xl font-bold">Faculty</h1>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Faculty</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Smith" /></div>
          <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" /></div>
          <div><Label>Email (optional)</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="smith@school.edu" /></div>
          <div><Label>Max Hours / Week</Label><Input type="number" value={maxHours} onChange={(e) => setMaxHours(e.target.value)} /></div>
          <div><Label>Max Classes / Day</Label><Input type="number" value={maxPerDay} onChange={(e) => setMaxPerDay(e.target.value)} /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4" disabled={addFaculty.isPending}>
          <Plus className="h-4 w-4 mr-1" />Add Faculty
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          💡 If the faculty's email matches a future signup, the account is auto-linked to this record.
        </p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Department</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Limits</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Subjects (mapped)</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && faculty.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No faculty yet.</td></tr>}
            {faculty.map((f) => {
              const mapped = subjectsForFaculty(f.id);
              return (
                <tr key={f.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{f.name}</div>
                    {f.email && <div className="text-xs text-muted-foreground">{f.email}</div>}
                  </td>
                  <td className="px-4 py-3">{f.department}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {f.max_hours_per_week}h/wk · {f.max_classes_per_day}/day
                  </td>
                  <td className="px-4 py-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <BookCheck className="h-3.5 w-3.5 mr-1.5" />
                          {mapped.length} subject{mapped.length === 1 ? "" : "s"}
                          <ChevronsUpDown className="h-3.5 w-3.5 ml-1.5 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="start">
                        <div className="p-3 border-b">
                          <p className="text-sm font-medium">Assign subjects to {f.name}</p>
                          <p className="text-xs text-muted-foreground">Used during timetable generation</p>
                        </div>
                        <div className="max-h-64 overflow-auto p-2">
                          {subjects.length === 0 && (
                            <p className="text-xs text-muted-foreground p-2">Add subjects first.</p>
                          )}
                          {subjects.map((s) => (
                            <label key={s.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                              <Checkbox
                                checked={mapped.includes(s.id)}
                                onCheckedChange={() => toggleMapping(f.id, s.id)}
                              />
                              <span className="text-sm">{s.name}</span>
                              <span className="text-xs text-muted-foreground ml-auto">{s.code}</span>
                            </label>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {mapped.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 max-w-xs">
                        {mapped.slice(0, 4).map((sid) => {
                          const s = subjects.find((x) => x.id === sid);
                          return s ? <Badge key={sid} variant="secondary" className="text-[10px]">{s.name}</Badge> : null;
                        })}
                        {mapped.length > 4 && <Badge variant="outline" className="text-[10px]">+{mapped.length - 4}</Badge>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setPendingDelete(f.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete this faculty member?"
        description="Their subject mappings and existing timetable assignments will also be cleared."
        onConfirm={() => { if (pendingDelete) deleteFaculty.mutate(pendingDelete); setPendingDelete(null); }}
      />
    </div>
  );
};

export default FacultyPage;
