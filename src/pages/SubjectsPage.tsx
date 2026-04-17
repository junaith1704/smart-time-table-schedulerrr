import { useState } from "react";
import { useSubjects, useAddSubject, useDeleteSubject } from "@/hooks/useTimetableData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, BookOpen } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const SubjectsPage = () => {
  const { data: subjects = [], isLoading } = useSubjects();
  const addSubject = useAddSubject();
  const deleteSubject = useDeleteSubject();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim() || !code.trim() || !department.trim()) return;
    addSubject.mutate(
      { name: name.trim(), code: code.trim(), department: department.trim() },
      { onSuccess: () => { setName(""); setCode(""); setDepartment(""); } }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600"><BookOpen className="h-5 w-5" /></div>
        <h1 className="text-2xl font-bold">Subjects</h1>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><Label>Subject Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Data Structures" /></div>
          <div><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CS201" /></div>
          <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4" disabled={addSubject.isPending}>
          <Plus className="h-4 w-4 mr-1" />Add Subject
        </Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Code</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Department</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && subjects.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No subjects yet.</td></tr>}
            {subjects.map((s) => (
              <tr key={s.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.code}</td>
                <td className="px-4 py-3">{s.department}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setPendingDelete(s.id)}>
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
        title="Delete this subject?"
        onConfirm={() => { if (pendingDelete) deleteSubject.mutate(pendingDelete); setPendingDelete(null); }}
      />
    </div>
  );
};

export default SubjectsPage;
