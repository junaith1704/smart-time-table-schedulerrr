import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DAYS, TIME_SLOTS } from "./scheduler";

interface Entry {
  class_id: string;
  day: string;
  time_slot: string;
  subject_name: string;
  faculty_name: string;
  classroom_name: string;
}

interface ClassRef {
  id: string;
  name: string;
}

function buildGrid(entries: Entry[]): string[][] {
  const head = ["Day", ...TIME_SLOTS];
  const rows = DAYS.map((day) => {
    const row = [day];
    for (const slot of TIME_SLOTS) {
      const e = entries.find((x) => x.day === day && x.time_slot === slot);
      row.push(e ? `${e.subject_name}\n${e.faculty_name}\n${e.classroom_name}` : "—");
    }
    return row;
  });
  return [head, ...rows];
}

export function exportTimetablePDF(title: string, entries: Entry[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  const grid = buildGrid(entries);
  autoTable(doc, {
    head: [grid[0]],
    body: grid.slice(1),
    startY: 22,
    styles: { fontSize: 8, cellPadding: 3, valign: "middle", halign: "center" },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [243, 244, 246] } },
  });
  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

export function exportAllClassesPDF(classes: ClassRef[], allEntries: Entry[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  classes.forEach((cls, idx) => {
    if (idx > 0) doc.addPage();
    doc.setFontSize(16);
    doc.text(`Timetable — ${cls.name}`, 14, 16);
    const entries = allEntries.filter((e) => e.class_id === cls.id);
    const grid = buildGrid(entries);
    autoTable(doc, {
      head: [grid[0]],
      body: grid.slice(1),
      startY: 22,
      styles: { fontSize: 8, cellPadding: 3, valign: "middle", halign: "center" },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      columnStyles: { 0: { fontStyle: "bold", fillColor: [243, 244, 246] } },
    });
  });
  doc.save("All_Class_Timetables.pdf");
}
