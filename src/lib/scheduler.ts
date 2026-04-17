export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const TIME_SLOTS = [
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "1:00 - 2:00",
  "2:00 - 3:00",
];

export interface SchedFaculty {
  id: string;
  name: string;
  max_hours_per_week: number;
  max_classes_per_day: number;
  subjectIds: string[];
}

export interface SchedSubject {
  id: string;
  name: string;
}

export interface SchedClass {
  id: string;
  name: string;
}

export interface SchedRoom {
  id: string;
  name: string;
}

export interface BuiltEntry {
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

export interface SchedulerResult {
  entries: BuiltEntry[];
  warnings: string[];
  error: string | null;
}

/**
 * Greedy scheduler with constraints:
 * - Faculty must be mapped to subject
 * - No back-to-back consecutive slots for same faculty (across all classes)
 * - Faculty max hours/week & max classes/day respected
 * - No double-booking: faculty or room at same (day,slot)
 * - Spread classes across days for each faculty
 */
export function generateTimetable(
  classes: SchedClass[],
  subjects: SchedSubject[],
  faculty: SchedFaculty[],
  rooms: SchedRoom[],
): SchedulerResult {
  const warnings: string[] = [];

  if (classes.length === 0) return { entries: [], warnings, error: "Add at least one class first." };
  if (subjects.length === 0) return { entries: [], warnings, error: "Add at least one subject first." };
  if (faculty.length === 0) return { entries: [], warnings, error: "Add at least one faculty member first." };
  if (rooms.length === 0) return { entries: [], warnings, error: "Add at least one classroom first." };

  // Verify each subject has at least one mapped teacher
  for (const subj of subjects) {
    const teachers = faculty.filter((f) => f.subjectIds.includes(subj.id));
    if (teachers.length === 0) {
      warnings.push(`No teacher is assigned to ${subj.name} — slots for this subject may be skipped.`);
    }
  }

  // Track occupancy
  const facultyBusy = new Map<string, Set<string>>(); // facultyId -> set of "day-slot"
  const roomBusy = new Map<string, Set<string>>();
  const facultyHours = new Map<string, number>();
  const facultyDayCount = new Map<string, Map<string, number>>(); // facultyId -> day -> count

  faculty.forEach((f) => {
    facultyBusy.set(f.id, new Set());
    facultyHours.set(f.id, 0);
    facultyDayCount.set(f.id, new Map());
  });
  rooms.forEach((r) => roomBusy.set(r.id, new Set()));

  const slotIndex = (slot: string) => TIME_SLOTS.indexOf(slot);

  const isBackToBack = (facultyId: string, day: string, slot: string): boolean => {
    const idx = slotIndex(slot);
    const busy = facultyBusy.get(facultyId)!;
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

        // try subjects in rotation, but cycle until we find one that fits
        let assigned = false;
        for (let attempt = 0; attempt < subjects.length && !assigned; attempt++) {
          const subj = subjects[(subjectRotation + attempt) % subjects.length];

          // find candidate teachers: mapped to subject, not busy, within limits, no back-to-back
          const candidates = faculty
            .filter((f) => f.subjectIds.includes(subj.id))
            .filter((f) => !facultyBusy.get(f.id)!.has(key))
            .filter((f) => (facultyHours.get(f.id) ?? 0) < f.max_hours_per_week)
            .filter((f) => (facultyDayCount.get(f.id)!.get(day) ?? 0) < f.max_classes_per_day)
            .filter((f) => !isBackToBack(f.id, day, slot));

          if (candidates.length === 0) continue;

          // prefer teacher with fewest classes on this day, then fewest total hours (spreads load)
          candidates.sort((a, b) => {
            const aDay = facultyDayCount.get(a.id)!.get(day) ?? 0;
            const bDay = facultyDayCount.get(b.id)!.get(day) ?? 0;
            if (aDay !== bDay) return aDay - bDay;
            return (facultyHours.get(a.id) ?? 0) - (facultyHours.get(b.id) ?? 0);
          });

          const teacher = candidates[0];

          // pick a free room
          const room = rooms.find((r) => !roomBusy.get(r.id)!.has(key));
          if (!room) continue;

          // commit
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

  return { entries, warnings, error: null };
}
