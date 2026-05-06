
export type TimetableEntry = {
  course: string;
  lecturer: string;
  location: string;
};

export type TimetableRow = {
  time: string;
  days: (TimetableEntry | null)[];
};

export type ParsedTimetable = {
  headers: string[];
  rows: TimetableRow[];
};

export type Course = {
  name: string;
  details: string;
  credits: number;
};

    