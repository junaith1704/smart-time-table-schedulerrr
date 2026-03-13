import { useState } from "react";
import { useAppData } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

const SubjectsPage = () => {
  const { subjects, addSubject, removeSubject } = useAppData();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !code.trim() || !department.trim()) return;
    addSubject({ name: name.trim(), code: code.trim(), department: department.trim() });
    setName(""); setCode(""); setDepartment("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subjects</h1>
      <div className="bg-card border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><Label>Subject Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Data Structures" /></div>
          <div><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CS201" /></div>
          <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4"><Plus className="h-4 w-4 mr-1" />Add Subject</Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Code</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Department</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {subjects.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No subjects added yet.</td></tr>}
            {subjects.map((s) => (
              <tr key={s.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.code}</td>
                <td className="px-4 py-3">{s.department}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => removeSubject(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectsPage;
