import { ParsedTimetable, TimetableEntry } from "@/lib/types";
import { format, startOfWeek, addDays, setHours, setMinutes } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function parseEntry(entry: TimetableEntry | null): { course: string, lecturer: string, location: string } {
    if (!entry) return { course: '', lecturer: '', location: '' };
    return {
        course: entry.course,
        lecturer: entry.lecturer,
        location: entry.location,
    };
}

export function exportToCSV(timetable: ParsedTimetable): void {
  const headers = "Day,StartTime,EndTime,Course,Lecturer,Location\n";
  const rows = timetable.rows.flatMap((row) => {
    const [startTime, endTime] = row.time.split(' - ');
    return row.days.map((entry, dayIndex) => {
      if (!entry) return null;
      const day = timetable.headers[dayIndex + 1];
      const { course, lecturer, location } = parseEntry(entry);
      return [day, startTime, endTime, `"${course}"`, `"${lecturer}"`, `"${location}"`].join(',');
    }).filter(Boolean);
  }).join('\n');

  const csvContent = headers + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "timetable.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function generateVEvent(dayIndex: number, time: string, entry: TimetableEntry): string {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const eventDate = addDays(weekStart, dayIndex);
    
    const [startTimeStr, endTimeStr] = time.split(' - ');
    if (!startTimeStr || !endTimeStr) return '';

    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);

    const startDate = setMinutes(setHours(eventDate, startHour), startMinute);
    const endDate = setMinutes(setHours(eventDate, endHour), endMinute);

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    
    const vevent = [
        'BEGIN:VEVENT',
        `UID:${new Date().getTime()}${Math.random()}@timewise.app`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${entry.course}`,
        `LOCATION:${entry.location}`,
        `DESCRIPTION:Lecturer: ${entry.lecturer}`,
        'END:VEVENT'
    ].join('\r\n');

    return vevent;
}

export function exportToICal(timetable: ParsedTimetable): void {
    const events = timetable.rows.flatMap(row => 
        row.days.map((entry, dayIndex) => {
            if (!entry) return null;
            return generateVEvent(dayIndex, row.time, entry);
        }).filter(Boolean)
    ).join('\r\n');

    const icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TimeWise//AI Timetable Generator//EN',
        events,
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "timetable.ics");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToPDF(timetable: ParsedTimetable): void {
  const doc = new jsPDF();
  
  doc.text("University Timetable", 14, 15);

  const head = [timetable.headers];
  const body = timetable.rows.map(row => {
    const time = row.time;
    const days = row.days.map(entry => {
      if (!entry) return "-";
      return `${entry.course}\n(${entry.lecturer}, ${entry.location})`;
    });
    return [time, ...days];
  });
  
  autoTable(doc, {
    head: head,
    body: body,
    startY: 20,
    styles: {
        valign: 'middle',
        halign: 'center',
        cellPadding: 2,
    },
    headStyles: {
        fillColor: [41, 128, 185], // A nice blue
        textColor: 255,
        fontStyle: 'bold',
    },
    didParseCell: function (data: unknown) {
        // Add course colors if you have them, similar to the web display
    },
  });

  doc.save('timetable.pdf');
}
