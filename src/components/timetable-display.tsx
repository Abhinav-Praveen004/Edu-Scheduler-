
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedTimetable, TimetableEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

// Parser function
export function parseTimetable(markdown: string): ParsedTimetable | null {
  if (!markdown || typeof markdown !== 'string') return null;

  // The AI might return the table as a single line with many `|` separators.
  // We can reconstruct the lines by finding the header and splitting the rest.
  const rawParts = markdown.replace(/\\n/g, '\n').trim().split('|').map(s => s.trim()).filter(Boolean);

  // A valid table must have a header and at least one row.
  // Headers: Time, Monday, Tuesday, Wednesday, Thursday, Friday (6 columns)
  // Separator: -----------------
  // Each row has 6 columns.
  const headerCandidates = ["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let headerStartIndex = -1;
  
  for (let i = 0; i < rawParts.length; i++) {
    if (headerCandidates.includes(rawParts[i])) {
      const potentialHeaders = rawParts.slice(i, i + headerCandidates.length);
      if (JSON.stringify(potentialHeaders) === JSON.stringify(headerCandidates)) {
        headerStartIndex = i;
        break;
      }
    }
  }

  if (headerStartIndex === -1) return null; // Headers not found

  const headers = rawParts.slice(headerStartIndex, headerStartIndex + headerCandidates.length);
  const numberOfColumns = headers.length;
  
  // The content starts after the headers and the markdown separator line.
  // The separator line can be of variable length and contains '---'.
  let contentStartIndex = headerStartIndex + numberOfColumns;
  while(contentStartIndex < rawParts.length && rawParts[contentStartIndex].includes('---')) {
    contentStartIndex++;
  }

  const contentParts = rawParts.slice(contentStartIndex);
  
  const rows: ParsedTimetable['rows'] = [];
  for (let i = 0; i < contentParts.length; i += numberOfColumns) {
      const chunk = contentParts.slice(i, i + numberOfColumns);
      if (chunk.length < numberOfColumns) continue; // Skip incomplete rows

      const time = chunk[0] || '';
      const days = chunk.slice(1).map(cell => {
          if (cell === "-") return null;
          const match = cell.match(/(.*) \((.*), (.*)\)/);
          if (match) {
              return {
                  course: match[1].trim(),
                  lecturer: match[2].trim(),
                  location: match[3].trim(),
              };
          }
          // Fallback for unexpected formats that might not be fully structured
          return { course: cell, lecturer: 'N/A', location: 'N/A' };
      });
      rows.push({ time, days });
  }

  if (rows.length === 0) return null;

  return { headers, rows };
}


// Color generation
const colorPalette = [
  "bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800",
  "bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800",
  "bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800",
  "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800",
  "bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800",
  "bg-pink-100 dark:bg-pink-900/50 border-pink-200 dark:border-pink-800",
  "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800",
  "bg-teal-100 dark:bg-teal-900/50 border-teal-200 dark:border-teal-800",
];

const getCourseColors = (timetable: ParsedTimetable | null): Record<string, string> => {
  if (!timetable) return {};
  const courses = new Set<string>();
  timetable.rows.forEach(row => {
    row.days.forEach(day => {
      if (day) courses.add(day.course);
    });
  });

  const courseColorMap: Record<string, string> = {};
  Array.from(courses).forEach((course, index) => {
    courseColorMap[course] = colorPalette[index % colorPalette.length];
  });
  return courseColorMap;
};

interface TimetableDisplayProps {
  timetable: ParsedTimetable | null;
}

export function TimetableDisplay({ timetable }: TimetableDisplayProps) {
  const courseColors = useMemo(() => getCourseColors(timetable), [timetable]);

  if (!timetable) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl text-primary">Generated Timetable</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-max text-sm text-left">
            <thead className="bg-muted">
              <tr>
                {timetable.headers.map((header, index) => (
                  <th key={index} className="p-3 font-semibold text-muted-foreground tracking-wider text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {timetable.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="divide-x">
                  <td className="p-3 font-medium whitespace-nowrap text-center text-muted-foreground">{row.time}</td>
                  {row.days.map((entry, dayIndex) => (
                    <td key={dayIndex} className={cn("p-0 align-top transition-colors", entry && courseColors[entry.course])}>
                      {entry ? (
                        <div className="p-3 h-full">
                          <p className="font-bold">{entry.course}</p>
                          <p className="text-xs text-muted-foreground">{entry.lecturer}</p>
                          <p className="text-xs text-muted-foreground">@{entry.location}</p>
                        </div>
                      ) : (
                        <div className="p-3 h-full">&nbsp;</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
