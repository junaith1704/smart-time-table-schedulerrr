import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ClassSection {
  id: string;
  name: string;
  department: string;
  year: number;
  section: string;
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  day: string;
  timeSlot: string;
  subject: string;
  faculty: string;
  classroom: string;
}

interface AppState {
  classes: ClassSection[];
  faculty: Faculty[];
  subjects: Subject[];
  classrooms: Classroom[];
  timetableEntries: TimetableEntry[];
  lastSaved: string | null;
  addClass: (c: Omit<ClassSection, "id">) => void;
  removeClass: (id: string) => void;
  addFaculty: (f: Omit<Faculty, "id">) => void;
  removeFaculty: (id: string) => void;
  addSubject: (s: Omit<Subject, "id">) => void;
  removeSubject: (id: string) => void;
  addClassroom: (c: Omit<Classroom, "id">) => void;
  removeClassroom: (id: string) => void;
  setTimetableEntries: (entries: TimetableEntry[]) => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "timetable-scheduler-data";

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data[key] ?? fallback;
    }
  } catch {}
  return fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassSection[]>(() => loadFromStorage("classes", []));
  const [faculty, setFaculty] = useState<Faculty[]>(() => loadFromStorage("faculty", []));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadFromStorage("subjects", []));
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => loadFromStorage("classrooms", []));
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(() => loadFromStorage("timetableEntries", []));
  const [lastSaved, setLastSaved] = useState<string | null>(() => loadFromStorage("lastSaved", null));

  useEffect(() => {
    const data = { classes, faculty, subjects, classrooms, timetableEntries, lastSaved };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [classes, faculty, subjects, classrooms, timetableEntries, lastSaved]);

  const addClass = (c: Omit<ClassSection, "id">) => setClasses((prev) => [...prev, { ...c, id: generateId() }]);
  const removeClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setTimetableEntries((prev) => prev.filter((e) => e.classId !== id));
  };
  const addFaculty = (f: Omit<Faculty, "id">) => setFaculty((prev) => [...prev, { ...f, id: generateId() }]);
  const removeFaculty = (id: string) => setFaculty((prev) => prev.filter((f) => f.id !== id));
  const addSubject = (s: Omit<Subject, "id">) => setSubjects((prev) => [...prev, { ...s, id: generateId() }]);
  const removeSubject = (id: string) => setSubjects((prev) => prev.filter((s) => s.id !== id));
  const addClassroom = (c: Omit<Classroom, "id">) => setClassrooms((prev) => [...prev, { ...c, id: generateId() }]);
  const removeClassroom = (id: string) => setClassrooms((prev) => prev.filter((c) => c.id !== id));

  const saveTimetableEntries = (entries: TimetableEntry[]) => {
    setTimetableEntries(entries);
    setLastSaved(new Date().toLocaleString());
  };

  return (
    <AppContext.Provider
      value={{
        classes, faculty, subjects, classrooms, timetableEntries, lastSaved,
        addClass, removeClass, addFaculty, removeFaculty,
        addSubject, removeSubject, addClassroom, removeClassroom,
        setTimetableEntries: saveTimetableEntries,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
}
