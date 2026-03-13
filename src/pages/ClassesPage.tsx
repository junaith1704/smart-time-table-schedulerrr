import { useState } from "react";
import { useAppData } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

const ClassesPage = () => {
  const { classes, addClass, removeClass } = useAppData();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("1");
  const [section, setSection] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !department.trim() || !section.trim()) return;
    addClass({ name: name.trim(), department: department.trim(), year: parseInt(year), section: section.trim() });
    setName(""); setDepartment(""); setSection("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classes</h1>
      <div className="bg-card border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Class</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><Label>Class Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CSE-1A" /></div>
          <div><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" /></div>
          <div><Label>Year</Label><Input type="number" min="1" max="5" value={year} onChange={(e) => setYear(e.target.value)} /></div>
          <div><Label>Section</Label><Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="A" /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4"><Plus className="h-4 w-4 mr-1" />Add Class</Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Department</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Year</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Section</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {classes.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No classes added yet.</td></tr>}
            {classes.map((c) => (
              <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.department}</td>
                <td className="px-4 py-3">{c.year}</td>
                <td className="px-4 py-3">{c.section}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => removeClass(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassesPage;
