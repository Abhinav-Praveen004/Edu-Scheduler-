import { supabase } from './supabase';

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
};

export type Course = {
  id?: number;
  name: string;
  details: string;
  credits: number;
};

export type StudentStats = {
  cumulativeScore: { score: number; total: number };
  cgpa: { score: number; total: number };
  attendance: { score: number; total: number };
  culturalActivities: { score: number; total: number };
};

export type Achievement = {
  name: string;
  status: 'Earned' | 'Locked';
  icon: 'Clock' | 'Trophy' | 'Target' | 'Award';
};

export type StudentData = {
  role: 'student';
  name: string;
  courseInformation: string;
  courseList: Course[];
  stats: StudentStats;
  achievements: Achievement[];
};

export type FacultyCourse = {
  name: string;
  code: string;
  studentsEnrolled: number;
  credits: number;
  rating: number;
};

export type FacultyStats = {
  totalStudents: number;
  averageRating: number;
  activeCourses: number;
  weeklyHours: number;
};

export type FacultyData = {
  role: 'faculty';
  name: string;
  stats: FacultyStats;
  courses: FacultyCourse[];
  teachingPreferences: {
    availableSlots: string[];
    teachingStyle: string[];
  };
  courseInformation: string;
  courseList: Course[];
};

export type UserData = StudentData | FacultyData;

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
  role: 'student' | 'faculty'
): Promise<DemoUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .eq('role', role)
    .single();

  if (error || !data) return null;
  return data as DemoUser;
}

export async function getAllUsers(): Promise<DemoUser[]> {
  const { data } = await supabase.from('users').select('id, name, email, role, password');
  const demoIds = ['s1', 's2', 's3', 's4', 's5', 'f1', 'f2', 'f3', 'f4', 'f5'];
  const demoUsers = (data as DemoUser[]) ?? [];
  return demoUsers.filter(u => demoIds.includes(u.id));
}

// ── User data ─────────────────────────────────────────────────────────────────

export async function getUserData(userId: string): Promise<UserData | null> {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) return null;

  if (user.role === 'student') {
    const [{ data: enrollments }, { data: stats }, { data: achievements }] =
      await Promise.all([
        supabase
          .from('enrollments')
          .select('courses(id, name, code, credits, users(name), location)')
          .eq('student_id', userId),
        supabase.from('student_stats').select('*').eq('student_id', userId).single(),
        supabase.from('achievements').select('*').eq('student_id', userId),
      ]);

    const courseList: Course[] = (enrollments ?? []).map((e: any) => ({
      id: e.courses.id,
      name: e.courses.name,
      details: e.courses.code,
      credits: e.courses.credits,
    }));

    const courseInformation = (enrollments ?? [])
      .map(
        (e: any) =>
          `- Course: ${e.courses.name} (${e.courses.code}), Lecturer: ${e.courses.users?.name ?? 'TBA'}, Location: ${e.courses.location}`
      )
      .join('\n');

    const s = stats as any;
    return {
      role: 'student',
      name: user.name,
      courseInformation,
      courseList,
      stats: {
        cumulativeScore: { score: s.cumulative_score, total: s.cumulative_total },
        cgpa: { score: s.cgpa, total: s.cgpa_total },
        attendance: { score: s.attendance, total: s.attendance_total },
        culturalActivities: { score: s.cultural_activities, total: s.cultural_total },
      },
      achievements: (achievements ?? []).map((a: any) => ({
        name: a.name,
        status: a.status as 'Earned' | 'Locked',
        icon: a.icon as Achievement['icon'],
      })),
    };
  }

  // Faculty
  const [{ data: courses }, { data: prefs }] = await Promise.all([
    supabase
      .from('courses')
      .select('name, code, credits, location, enrollments(count)')
      .eq('lecturer_id', userId),
    supabase.from('faculty_preferences').select('*').eq('faculty_id', userId).single(),
  ]);

  const facultyCourses: FacultyCourse[] = (courses ?? []).map((c: any) => ({
    name: c.name,
    code: c.code,
    credits: c.credits,
    studentsEnrolled: c.enrollments?.[0]?.count ?? 0,
    rating: 4.7,
  }));

  const courseList: Course[] = facultyCourses.map((c) => ({
    name: c.name,
    details: c.code,
    credits: c.credits,
  }));

  const courseInformation = (courses ?? [])
    .map((c: any) => `- Course: ${c.name} (${c.code}), Location: ${c.location}`)
    .join('\n');

  const totalStudents = facultyCourses.reduce((s, c) => s + c.studentsEnrolled, 0);

  return {
    role: 'faculty',
    name: user.name,
    stats: {
      totalStudents,
      averageRating: 4.7,
      activeCourses: facultyCourses.length,
      weeklyHours: facultyCourses.length * 6,
    },
    courses: facultyCourses,
    teachingPreferences: {
      availableSlots: prefs?.available_slots ?? [],
      teachingStyle: prefs?.teaching_style ?? [],
    },
    courseInformation,
    courseList,
  };
}

// ── Timetable persistence ─────────────────────────────────────────────────────

export async function saveTimetable(
  userId: string,
  preference: string,
  timetableData: object
) {
  const { error } = await supabase.from('timetables').insert({
    user_id: userId,
    preference,
    timetable_data: timetableData,
  });
  return !error;
}

export async function getLatestTimetable(userId: string) {
  const { data } = await supabase
    .from('timetables')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export async function submitFeedback(userId: string, message: string) {
  const { error } = await supabase
    .from('feedback')
    .insert({ user_id: userId, message });
  return !error;
}

// ── Faculty preferences ───────────────────────────────────────────────────────

export async function updateFacultyPreferences(
  facultyId: string,
  availableSlots: string[],
  teachingStyle: string[]
) {
  const { error } = await supabase
    .from('faculty_preferences')
    .upsert({ faculty_id: facultyId, available_slots: availableSlots, teaching_style: teachingStyle });
  return !error;
}

export async function updateStudentEnrollments(
  studentId: string,
  courseIds: number[]
) {
  const { error: deleteError } = await supabase
    .from('enrollments')
    .delete()
    .eq('student_id', studentId);
  if (deleteError) return false;

  if (courseIds.length > 0) {
    const { error: insertError } = await supabase
      .from('enrollments')
      .insert(courseIds.map((course_id) => ({ student_id: studentId, course_id })));
    if (insertError) return false;
  }

  return true;
}

export const demoUsers: DemoUser[] = [];

// ── Registration ──────────────────────────────────────────────────────────────

export async function getAvailableCourses() {
  const { data } = await supabase
    .from('courses')
    .select('id, code, name, credits, location, users(name)');
  return (data ?? []) as any[];
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'student' | 'faculty',
  courseIds?: number[],          // for students: courses to enroll in
  availableSlots?: string[],     // for faculty
  teachingStyle?: string[]       // for faculty
): Promise<{ success: boolean; error?: string; userId?: string }> {
  // Check email uniqueness
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  if (existing) return { success: false, error: 'Email already registered.' };

  const id = `${role[0]}${Date.now()}`;

  const { error: userErr } = await supabase
    .from('users')
    .insert({ id, name, email, password, role });
  if (userErr) return { success: false, error: userErr.message };

  if (role === 'student') {
    await supabase.from('student_stats').insert({
      student_id: id,
      cumulative_score: 0, cumulative_total: 30,
      cgpa: 0, cgpa_total: 10,
      attendance: 0, attendance_total: 10,
      cultural_activities: 0, cultural_total: 10,
    });
    await supabase.from('achievements').insert([
      { student_id: id, name: 'Regular Attendee', status: 'Locked', icon: 'Clock' },
      { student_id: id, name: 'Top Performer',    status: 'Locked', icon: 'Trophy' },
      { student_id: id, name: 'Well Rounded',     status: 'Locked', icon: 'Target' },
      { student_id: id, name: 'Course Master',    status: 'Locked', icon: 'Award' },
    ]);
    if (courseIds?.length) {
      await supabase.from('enrollments').insert(
        courseIds.map(course_id => ({ student_id: id, course_id }))
      );
    }
  } else {
    await supabase.from('faculty_preferences').insert({
      faculty_id: id,
      available_slots: availableSlots ?? [],
      teaching_style: teachingStyle ?? [],
    });
  }

  return { success: true, userId: id };
}
