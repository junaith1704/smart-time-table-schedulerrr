import { useState } from "react";
import { useAppData } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

const FacultyPage = () => {
  const { faculty, addFaculty, removeFaculty } = useAppData();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !department.trim()) return;
    addFaculty({ name: name.trim(), department: department.trim() });
    setName(""); setDepartment("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Faculty</h1>
      <div className="bg-card border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Faculty</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Smith" /></div>
          <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4"><Plus className="h-4 w-4 mr-1" />Add Faculty</Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Department</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {faculty.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No faculty added yet.</td></tr>}
            {faculty.map((f) => (
              <tr key={f.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3">{f.department}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => removeFaculty(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyPage;
