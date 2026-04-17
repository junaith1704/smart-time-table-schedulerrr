import { useState } from "react";
import { useClassrooms, useAddClassroom, useDeleteClassroom } from "@/hooks/useTimetableData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, DoorOpen } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const RoomsPage = () => {
  const { data: classrooms = [], isLoading } = useClassrooms();
  const addRoom = useAddClassroom();
  const deleteRoom = useDeleteClassroom();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("40");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    addRoom.mutate(
      { name: name.trim(), capacity: parseInt(capacity) || 40 },
      { onSuccess: () => { setName(""); setCapacity("40"); } }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600"><DoorOpen className="h-5 w-5" /></div>
        <h1 className="text-2xl font-bold">Classrooms</h1>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Add New Classroom</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Room Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room 101" /></div>
          <div><Label>Capacity</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
        </div>
        <Button onClick={handleAdd} className="mt-4" disabled={addRoom.isPending}>
          <Plus className="h-4 w-4 mr-1" />Add Room
        </Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50">
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Capacity</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && classrooms.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No rooms yet.</td></tr>}
            {classrooms.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.capacity}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setPendingDelete(r.id)}>
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
        title="Delete this room?"
        onConfirm={() => { if (pendingDelete) deleteRoom.mutate(pendingDelete); setPendingDelete(null); }}
      />
    </div>
  );
};

export default RoomsPage;
