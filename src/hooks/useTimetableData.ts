import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClassRow { id: string; name: string; department: string; year: number; section: string; }
export interface SubjectRow { id: string; name: string; code: string; department: string; }
export interface ClassroomRow { id: string; name: string; capacity: number; }
export interface FacultyRow {
  id: string; name: string; department: string; email: string | null;
  max_hours_per_week: number; max_classes_per_day: number; auth_user_id: string | null;
}
export interface FacultySubjectRow { id: string; faculty_id: string; subject_id: string; }
export interface TimetableEntryRow {
  id: string; class_id: string; day: string; time_slot: string;
  subject_id: string | null; subject_name: string;
  faculty_id: string | null; faculty_name: string;
  classroom_id: string | null; classroom_name: string;
}

// ---------- CLASSES ----------
export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as ClassRow[];
    },
  });
}
export function useAddClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: Omit<ClassRow, "id">) => {
      const { error } = await supabase.from("classes").insert(c);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); toast.success("Class added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["timetable_entries"] });
      toast.success("Class deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- SUBJECTS ----------
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as SubjectRow[];
    },
  });
}
export function useAddSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Omit<SubjectRow, "id">) => {
      const { error } = await supabase.from("subjects").insert(s);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subjects"] }); toast.success("Subject added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["faculty_subjects"] });
      toast.success("Subject deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- CLASSROOMS ----------
export function useClassrooms() {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classrooms").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as ClassroomRow[];
    },
  });
}
export function useAddClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: Omit<ClassroomRow, "id">) => {
      const { error } = await supabase.from("classrooms").insert(c);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classrooms"] }); toast.success("Room added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useDeleteClassroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classrooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classrooms"] }); toast.success("Room deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- FACULTY ----------
export function useFaculty() {
  return useQuery({
    queryKey: ["faculty"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faculty").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as FacultyRow[];
    },
  });
}
export function useAddFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (f: Omit<FacultyRow, "id" | "auth_user_id">) => {
      const { error } = await supabase.from("faculty").insert(f);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["faculty"] }); toast.success("Faculty added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useDeleteFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faculty").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faculty"] });
      qc.invalidateQueries({ queryKey: ["faculty_subjects"] });
      toast.success("Faculty deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- FACULTY SUBJECTS ----------
export function useFacultySubjects() {
  return useQuery({
    queryKey: ["faculty_subjects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faculty_subjects").select("*");
      if (error) throw error;
      return (data ?? []) as FacultySubjectRow[];
    },
  });
}
export function useSetFacultySubjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ facultyId, subjectIds }: { facultyId: string; subjectIds: string[] }) => {
      // Replace mappings: delete then insert
      const { error: delErr } = await supabase.from("faculty_subjects").delete().eq("faculty_id", facultyId);
      if (delErr) throw delErr;
      if (subjectIds.length > 0) {
        const rows = subjectIds.map((subject_id) => ({ faculty_id: facultyId, subject_id }));
        const { error } = await supabase.from("faculty_subjects").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["faculty_subjects"] }); toast.success("Subjects updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- TIMETABLE ENTRIES ----------
export function useTimetableEntries() {
  return useQuery({
    queryKey: ["timetable_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("timetable_entries").select("*");
      if (error) throw error;
      return (data ?? []) as TimetableEntryRow[];
    },
  });
}
export function useReplaceTimetableEntries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entries: Omit<TimetableEntryRow, "id">[]) => {
      const { error: delErr } = await supabase.from("timetable_entries").delete().not("id", "is", null);
      if (delErr) throw delErr;
      if (entries.length > 0) {
        const { error } = await supabase.from("timetable_entries").insert(entries);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timetable_entries"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}
