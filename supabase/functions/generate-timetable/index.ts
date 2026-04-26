// Edge Function: generate-timetable
// Runs the constraint-based scheduling algorithm server-side.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "1:00 - 2:00",
  "2:00 - 3:00",
];

interface SchedFaculty {
  id: string;
  name: string;
  max_hours_per_week: number;
  max_classes_per_day: number;
  subjectIds: string[];
}
interface SchedSubject { id: string; name: string }
interface SchedClass { id: string; name: string }
interface SchedRoom { id: string; name: string }

interface BuiltEntry {
  class_id: string;
  day: string;
  time_slot: string;
  subject_id: string;
  subject_name: string;
  faculty_id: string;
  faculty_name: string;
  classroom_id: string;
  classroom_name: string;
}

function generateTimetable(
  classes: SchedClass[],
  subjects: SchedSubject[],
  faculty: SchedFaculty[],
  rooms: SchedRoom[],
) {
  const warnings: string[] = [];
  if (classes.length === 0) return { entries: [], warnings, error: "Add at least one class first." };
  if (subjects.length === 0) return { entries: [], warnings, error: "Add at least one subject first." };
  if (faculty.length === 0) return { entries: [], warnings, error: "Add at least one faculty member first." };
  if (rooms.length === 0) return { entries: [], warnings, error: "Add at least one classroom first." };

  for (const subj of subjects) {
    const teachers = faculty.filter((f) => f.subjectIds.includes(subj.id));
    if (teachers.length === 0) {
      warnings.push(`No teacher is assigned to ${subj.name} — slots for this subject may be skipped.`);
    }
  }

  const facultyBusy = new Map<string, Set<string>>();
  const roomBusy = new Map<string, Set<string>>();
  const facultyHours = new Map<string, number>();
  const facultyDayCount = new Map<string, Map<string, number>>();

  faculty.forEach((f) => {
    facultyBusy.set(f.id, new Set());
    facultyHours.set(f.id, 0);
    facultyDayCount.set(f.id, new Map());
  });
  rooms.forEach((r) => roomBusy.set(r.id, new Set()));

  const slotIndex = (s: string) => TIME_SLOTS.indexOf(s);
  const isBackToBack = (fid: string, day: string, slot: string) => {
    const idx = slotIndex(slot);
    const busy = facultyBusy.get(fid)!;
    if (idx > 0 && busy.has(`${day}-${TIME_SLOTS[idx - 1]}`)) return true;
    if (idx < TIME_SLOTS.length - 1 && busy.has(`${day}-${TIME_SLOTS[idx + 1]}`)) return true;
    return false;
  };

  const entries: BuiltEntry[] = [];

  for (const cls of classes) {
    let subjectRotation = 0;
    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        const key = `${day}-${slot}`;
        let assigned = false;
        for (let attempt = 0; attempt < subjects.length && !assigned; attempt++) {
          const subj = subjects[(subjectRotation + attempt) % subjects.length];
          const candidates = faculty
            .filter((f) => f.subjectIds.includes(subj.id))
            .filter((f) => !facultyBusy.get(f.id)!.has(key))
            .filter((f) => (facultyHours.get(f.id) ?? 0) < f.max_hours_per_week)
            .filter((f) => (facultyDayCount.get(f.id)!.get(day) ?? 0) < f.max_classes_per_day)
            .filter((f) => !isBackToBack(f.id, day, slot));

          if (candidates.length === 0) continue;

          candidates.sort((a, b) => {
            const aDay = facultyDayCount.get(a.id)!.get(day) ?? 0;
            const bDay = facultyDayCount.get(b.id)!.get(day) ?? 0;
            if (aDay !== bDay) return aDay - bDay;
            return (facultyHours.get(a.id) ?? 0) - (facultyHours.get(b.id) ?? 0);
          });

          const teacher = candidates[0];
          const room = rooms.find((r) => !roomBusy.get(r.id)!.has(key));
          if (!room) continue;

          facultyBusy.get(teacher.id)!.add(key);
          roomBusy.get(room.id)!.add(key);
          facultyHours.set(teacher.id, (facultyHours.get(teacher.id) ?? 0) + 1);
          const dayMap = facultyDayCount.get(teacher.id)!;
          dayMap.set(day, (dayMap.get(day) ?? 0) + 1);

          entries.push({
            class_id: cls.id,
            day,
            time_slot: slot,
            subject_id: subj.id,
            subject_name: subj.name,
            faculty_id: teacher.id,
            faculty_name: teacher.name,
            classroom_id: room.id,
            classroom_name: room.name,
          });
          subjectRotation = (subjectRotation + attempt + 1) % Math.max(subjects.length, 1);
          assigned = true;
        }
        if (!assigned) {
          warnings.push(
            `Could not fill ${cls.name} on ${day} at ${slot}. Add more teachers, map more teachers to subjects, or raise teacher limits.`,
          );
        }
      }
    }
  }

  return { entries, warnings, error: null as string | null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for full read of inputs and to replace timetable_entries
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [classesRes, subjectsRes, facultyRes, roomsRes, mapsRes] = await Promise.all([
      admin.from("classes").select("id,name").order("created_at"),
      admin.from("subjects").select("id,name").order("created_at"),
      admin.from("faculty").select("id,name,max_hours_per_week,max_classes_per_day").order("created_at"),
      admin.from("classrooms").select("id,name").order("created_at"),
      admin.from("faculty_subjects").select("faculty_id,subject_id"),
    ]);

    const firstErr = [classesRes, subjectsRes, facultyRes, roomsRes, mapsRes].find((r) => r.error);
    if (firstErr?.error) throw firstErr.error;

    const schedFaculty: SchedFaculty[] = (facultyRes.data ?? []).map((f: any) => ({
      id: f.id,
      name: f.name,
      max_hours_per_week: f.max_hours_per_week,
      max_classes_per_day: f.max_classes_per_day,
      subjectIds: (mapsRes.data ?? []).filter((m: any) => m.faculty_id === f.id).map((m: any) => m.subject_id),
    }));

    const result = generateTimetable(
      (classesRes.data ?? []) as SchedClass[],
      (subjectsRes.data ?? []) as SchedSubject[],
      schedFaculty,
      (roomsRes.data ?? []) as SchedRoom[],
    );

    if (result.error) {
      return new Response(JSON.stringify(result), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist: replace all entries
    const { error: delErr } = await admin.from("timetable_entries").delete().not("id", "is", null);
    if (delErr) throw delErr;
    if (result.entries.length > 0) {
      const { error: insErr } = await admin.from("timetable_entries").insert(result.entries);
      if (insErr) throw insErr;
    }

    return new Response(JSON.stringify(result), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
