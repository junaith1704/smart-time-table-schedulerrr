import { useState } from "react";
import { useClasses, useAddClass, useDeleteClass } from "@/hooks/useTimetableData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GraduationCap } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const ClassesPage = () => {
  const { data: classes = [], isLoading } = useClasses();
  const addClass = useAddClass();
  const deleteClass = useDeleteClass();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("1");
  const [section, setSection] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim() || !department.trim() || !section.trim()) return;
    addClass.mutate(
      { name: name.trim(), department: department.trim(), year: parseInt(year), section: section.trim() },
      { onSuccess: () => { setName(""); setDepartment(""); setSection(""); } }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" /></div>
        <h1 className="text-2xl font-bold">Classes</h1>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Class</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><Label>Class Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CSE-1A" /></div>
          <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" /></div>
          <div><Label>Year</Label><Input type="number" min="1" max="5" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><Label>Section</Label><Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="A" /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4" disabled={addClass.isPending}>
          <Plus className="h-4 w-4 mr-1" />Add Class
        </Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Department</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Year</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Section</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && classes.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No classes yet.</td></tr>}
            {classes.map((c) => (
              <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.department}</td>
                <td className="px-4 py-3">{c.year}</td>
                <td className="px-4 py-3">{c.section}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setPendingDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete this class?"
        description="This will also remove all timetable entries for this class."
        onConfirm={() => { if (pendingDelete) deleteClass.mutate(pendingDelete); setPendingDelete(null); }}
      />
    </div>
  );
};

export default ClassesPage;
