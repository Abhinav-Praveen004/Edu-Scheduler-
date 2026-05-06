-- Users table
create table public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('student', 'faculty'))
);

-- Courses table
create table public.courses (
  id serial primary key,
  code text not null unique,
  name text not null,
  credits integer not null,
  lecturer_id text references public.users(id),
  location text,
  duration_hours integer default 1
);

-- Student enrollments
create table public.enrollments (
  id serial primary key,
  student_id text references public.users(id),
  course_id integer references public.courses(id),
  unique(student_id, course_id)
);

-- Student stats
create table public.student_stats (
  student_id text primary key references public.users(id),
  cumulative_score numeric,
  cumulative_total numeric,
  cgpa numeric,
  cgpa_total numeric,
  attendance numeric,
  attendance_total numeric,
  cultural_activities numeric,
  cultural_total numeric
);

-- Achievements
create table public.achievements (
  id serial primary key,
  student_id text references public.users(id),
  name text,
  status text check (status in ('Earned', 'Locked')),
  icon text
);

-- Generated timetables
create table public.timetables (
  id serial primary key,
  user_id text references public.users(id),
  created_at timestamptz default now(),
  preference text,
  timetable_data jsonb not null
);

-- Feedback
create table public.feedback (
  id serial primary key,
  user_id text references public.users(id),
  message text not null,
  created_at timestamptz default now()
);

-- Faculty teaching preferences
create table public.faculty_preferences (
  faculty_id text primary key references public.users(id),
  available_slots text[],
  teaching_style text[]
);

-- =====================
-- SEED DATA
-- =====================

insert into public.users (id, name, email, password, role) values
  ('s1', 'Alice Johnson',  'alice@university.edu',  'password123', 'student'),
  ('s2', 'Bob Williams',   'bob@university.edu',    'password123', 'student'),
  ('s3', 'Charlie Brown',  'charlie@university.edu','password123', 'student'),
  ('s4', 'Diana Miller',   'diana@university.edu',  'password123', 'student'),
  ('s5', 'Eve Davis',      'eve@university.edu',    'password123', 'student'),
  ('f1', 'Dr. Smith',      'smith@university.edu',  'faculty123',  'faculty'),
  ('f2', 'Prof. Doe',      'doe@university.edu',    'faculty123',  'faculty'),
  ('f3', 'Dr. Jones',      'jones@university.edu',  'faculty123',  'faculty'),
  ('f4', 'Prof. Stark',    'stark@university.edu',  'faculty123',  'faculty'),
  ('f5', 'Dr. Banner',     'banner@university.edu', 'faculty123',  'faculty');

insert into public.courses (code, name, credits, lecturer_id, location, duration_hours) values
  ('CS101',   'Computer Science Basics',      4, 'f1', 'Hall A',      1),
  ('MATH301', 'Advanced Mathematics',         4, 'f2', 'Room 201',    1),
  ('PHYS201', 'Physics Fundamentals',         3, 'f3', 'Lab 3',       2),
  ('EE101',   'Basic Electrical Engineering', 3, 'f4', 'EE Building', 1),
  ('CHEM151', 'Chemistry Lab',                2, 'f5', 'Chem Lab',    1),
  ('CS201',   'Data Structures',              3, 'f1', 'Hall B',      1),
  ('MA201',   'Linear Algebra',               3, 'f2', 'Room 202',    1),
  ('ME101',   'Intro to Mechanics',           4, 'f5', 'Mech Hall',   2);

insert into public.enrollments (student_id, course_id)
select 's1', id from public.courses where code in ('CS101','MATH301','PHYS201','CHEM151','CS201');
insert into public.enrollments (student_id, course_id)
select 's2', id from public.courses where code in ('CS201','MA201','EE101');
insert into public.enrollments (student_id, course_id)
select 's3', id from public.courses where code in ('ME101','MATH301','PHYS201','CHEM151');
insert into public.enrollments (student_id, course_id)
select 's4', id from public.courses where code in ('CS101','MA201','EE101');
insert into public.enrollments (student_id, course_id)
select 's5', id from public.courses where code in ('CS101','CS201','MATH301','MA201');

insert into public.student_stats values
  ('s1', 25.5, 30, 8.5, 10, 9.2, 10, 7,   10),
  ('s2', 28,   30, 9.1, 10, 9.8, 10, 8,   10),
  ('s3', 22,   30, 7.5, 10, 8.5, 10, 9,   10),
  ('s4', 26,   30, 8.8, 10, 9.0, 10, 6,   10),
  ('s5', 24,   30, 8.2, 10, 9.5, 10, 5,   10);

insert into public.achievements (student_id, name, status, icon) values
  ('s1','Regular Attendee','Earned','Clock'),('s1','Top Performer','Earned','Trophy'),
  ('s1','Well Rounded','Locked','Target'),   ('s1','Course Master','Earned','Award'),
  ('s2','Regular Attendee','Earned','Clock'),('s2','Top Performer','Locked','Trophy'),
  ('s2','Well Rounded','Earned','Target'),   ('s2','Course Master','Locked','Award'),
  ('s3','Regular Attendee','Locked','Clock'),('s3','Top Performer','Locked','Trophy'),
  ('s3','Well Rounded','Earned','Target'),   ('s3','Course Master','Earned','Award'),
  ('s4','Regular Attendee','Earned','Clock'),('s4','Top Performer','Earned','Trophy'),
  ('s4','Well Rounded','Earned','Target'),   ('s4','Course Master','Locked','Award'),
  ('s5','Regular Attendee','Earned','Clock'),('s5','Top Performer','Locked','Trophy'),
  ('s5','Well Rounded','Locked','Target'),   ('s5','Course Master','Locked','Award');

insert into public.faculty_preferences (faculty_id, available_slots, teaching_style) values
  ('f1', array['Morning'],            array['Fast-paced','Real-world focused','Question-heavy']),
  ('f2', array['Morning','Afternoon'],array['Slow-paced','Theory-focused']),
  ('f3', array['Afternoon'],          array['PPT-based','Question-heavy']),
  ('f4', array['Morning'],            array['Real-world focused','Fast-paced']),
  ('f5', array['Morning','Afternoon'],array['Slow-paced','Real-world focused']);
