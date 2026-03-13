import { useState } from "react";
import { useAppData } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

const RoomsPage = () => {
  const { classrooms, addClassroom, removeClassroom } = useAppData();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("40");

  const handleAdd = () => {
    if (!name.trim()) return;
    addClassroom({ name: name.trim(), capacity: parseInt(capacity) || 40 });
    setName(""); setCapacity("40");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classrooms</h1>
      <div className="bg-card border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Classroom</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Room Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room 101" /></div>
          <div><Label>Capacity</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4"><Plus className="h-4 w-4 mr-1" />Add Room</Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Capacity</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {classrooms.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No rooms added yet.</td></tr>}
            {classrooms.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.capacity}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => removeClassroom(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomsPage;
