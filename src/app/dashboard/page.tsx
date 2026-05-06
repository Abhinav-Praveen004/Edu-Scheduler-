
'use client'
import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import { Loader, User, LogOut, BookOpen, Calendar, Download, Star, Wand2, Clock, Trophy, Target, Award, CheckCircle2, TrophyIcon, Users, Settings, Briefcase, View, Check, Palette, PieChart, Drama, Edit, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { getUserData, StudentData, Achievement, FacultyData, FacultyCourse, submitFeedback, updateFacultyPreferences, getAvailableCourses, updateStudentEnrollments } from "@/lib/demo-data";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

function DashboardHeader({ name, role }: { name: string, role: 'student' | 'faculty' }) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {name}!</h1>
        <p className="text-gray-500 dark:text-gray-400">Your personalized {role} dashboard</p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          {role === 'student' ? <User className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
          <span className="capitalize">{role}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}

// Student Dashboard Components
function StudentStatsCards({ stats }: { stats: StudentData['stats'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-purple-200">Cumulative Score</CardTitle>
          <PieChart className="h-5 w-5 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.cumulativeScore.score}<span className="text-2xl">/{stats.cumulativeScore.total}</span></div>
          <p className="text-xs text-purple-200 mt-1">Click for detailed breakdown</p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">CGPA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.cgpa.score}<span className="text-base">/{stats.cgpa.total}</span></div>
          <Progress value={(stats.cgpa.score / stats.cgpa.total) * 100} className="h-1 mt-2 bg-green-100 [&>div]:bg-green-500" />
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.attendance.score}<span className="text-base">/{stats.attendance.total}</span></div>
           <Progress value={(stats.attendance.score / stats.attendance.total) * 100} className="h-1 mt-2 bg-blue-100 [&>div]:bg-blue-500" />
        </CardContent>
      </Card>
       <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Cultural Activities</CardTitle>
          <Drama className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.culturalActivities.score}<span className="text-base">/{stats.culturalActivities.total}</span></div>
           <Progress value={(stats.culturalActivities.score / stats.culturalActivities.total) * 100} className="h-1 mt-2 bg-orange-100 [&>div]:bg-orange-500" />
        </CardContent>
      </Card>
    </div>
  );
}

function EnrolledCourses({ courses, userId }: { courses: StudentData['courseList'], userId: string }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [allCourses, setAllCourses] = React.useState<any[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [displayCourses, setDisplayCourses] = React.useState<StudentData['courseList']>(courses);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setDisplayCourses(courses);
    const ids = courses.map((c) => c.id).filter((id): id is number => typeof id === 'number');
    setSelectedIds(ids);
  }, [courses]);

  React.useEffect(() => {
    if (!isEditing) return;
    getAvailableCourses().then(setAllCourses);
  }, [isEditing]);

  const toggleCourse = (courseId: number) => {
    setSelectedIds((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await updateStudentEnrollments(userId, selectedIds);
    setIsSaving(false);
    if (ok) {
      const updated = allCourses
        .filter((c) => selectedIds.includes(c.id))
        .map((c) => ({ id: c.id, name: c.name, details: c.code, credits: c.credits }));
      setDisplayCourses(updated);
      setIsEditing(false);
      toast({ title: 'Enrollments updated', description: 'Your courses have been saved.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update enrollments.' });
    }
  };

  const handleCancel = () => {
    const ids = displayCourses.map((c) => c.id).filter((id): id is number => typeof id === 'number');
    setSelectedIds(ids);
    setIsEditing(false);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700 dark:text-white">Enrolled Courses</span>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing && (
          <>
            {displayCourses.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses enrolled yet.</p>
            )}
            <ul className="space-y-2">
              {displayCourses.map((course, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{course.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.details}</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{course.credits} Credits</Badge>
                </li>
              ))}
            </ul>
          </>
        )}

        {isEditing && (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
              {allCourses.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`course-edit-${c.id}`}
                    checked={selectedIds.includes(c.id)}
                    onCheckedChange={() => toggleCourse(c.id)}
                  />
                  <Label htmlFor={`course-edit-${c.id}`} className="cursor-pointer text-sm">
                    {c.name} <span className="text-muted-foreground">({c.code}) - {c.credits} cr</span>
                  </Label>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackDialog({ open, onOpenChange, userId }: { open: boolean, onOpenChange: (open: boolean) => void, userId: string | null }) {
    const { toast } = useToast();
    const [feedback, setFeedback] = React.useState('');

    const handleSubmit = async () => {
        if(feedback.trim().length < 10) {
            toast({ variant: 'destructive', title: 'Feedback too short', description: 'Please provide at least 10 characters.' });
            return;
        }
        const ok = userId ? await submitFeedback(userId, feedback) : false;
        toast(ok
            ? { title: 'Feedback submitted!', description: 'Thank you for your valuable input.' }
            : { variant: 'destructive', title: 'Error', description: 'Could not save feedback.' }
        );
        onOpenChange(false);
        setFeedback('');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Give Feedback</DialogTitle>
                    <DialogDescription>
                        We value your feedback. Please let us know how we can improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="feedback-textarea">Your Feedback</Label>
                        <Textarea id="feedback-textarea" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Tell us about your experience..." rows={5} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit}>Submit Feedback</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function TimetableActions() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

    return (
        <>
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700 dark:text-white">My Timetable</span>
                    <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                 <Button className="w-full justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700" onClick={() => router.push(`/dashboard/timetable?userId=${userId}`)}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Make My Timetable
                </Button>
                <p className="text-xs text-center text-muted-foreground">Generate your timetable to enable export options.</p>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full justify-center bg-green-500 text-white hover:bg-green-600" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button variant="outline" className="w-full justify-center bg-blue-500 text-white hover:bg-blue-600" disabled>
                        <Calendar className="mr-2 h-4 w-4" />
                        Sync Calendar
                    </Button>
                </div>
                <Button variant="outline" className="w-full justify-center bg-orange-500 text-white hover:bg-orange-600" onClick={() => setIsFeedbackOpen(true)}>
                    <Star className="mr-2 h-4 w-4" />
                    Give Feedback
                </Button>
            </CardContent>
        </Card>
        <FeedbackDialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} userId={userId} />
        </>
    );
}

const iconMap: Record<Achievement['icon'], React.ElementType> = {
  Clock: Clock,
  Trophy: Trophy,
  Target: Target,
  Award: Award,
};

function Achievements({ achievements }: { achievements: StudentData['achievements'] }) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700 dark:text-white">Achievements &amp; Badges</span>
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = iconMap[achievement.icon];
            const isEarned = achievement.status === 'Earned';
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all border",
                  isEarned ? "bg-green-100/50 dark:bg-green-900/30 border-green-200 dark:border-green-800" : "bg-gray-100 dark:bg-gray-700/20 border-gray-200 dark:border-gray-700 border-dashed",
                )}
              >
                <div className={cn(
                  "p-2 rounded-full mb-2",
                  isEarned ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'
                )}>
                  <Icon className={cn("h-6 w-6", isEarned ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400')} />
                </div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{achievement.name}</p>
                <div className="flex items-center gap-1 text-xs">
                  {isEarned ? <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" /> : null}
                  <span className={isEarned ? "font-semibold text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                    {achievement.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Faculty Dashboard Components
function FacultyStatsCards({ stats, courses }: { stats: FacultyData['stats'], courses: FacultyData['courses'] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-blue-600 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-5 w-5 text-blue-200" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-blue-200 mt-1 truncate" title={courses.map(c => `${c.studentsEnrolled} in ${c.code}`).join(' + ')}>
            (
              {courses.map(c => `${c.studentsEnrolled} in ${c.code}`).join(' + ')}
            )
          </p>
        </CardContent>
      </Card>
      <Card className="bg-orange-500 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-5 w-5 text-orange-200" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.averageRating} <span className="text-2xl">/ 5</span></div>
        </CardContent>
      </Card>
      <Card className="bg-green-600 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          <BookOpen className="h-5 w-5 text-green-200" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.activeCourses}</div>
        </CardContent>
      </Card>
      <Card className="bg-purple-600 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
          <Clock className="h-5 w-5 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.weeklyHours}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseManagement({ courses }: { courses: FacultyData['courses'] }) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700 dark:text-white">Course Management</span>
          <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {courses.map((course, index) => (
            <li key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{course.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{course.code}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.studentsEnrolled} students enrolled</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-2">{course.credits} Credits</Badge>
                  <div className="flex items-center justify-end gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                    <Star className="h-4 w-4" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TeachingPreferences({ preferences }: { preferences: FacultyData['teachingPreferences'] }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [selectedSlots, setSelectedSlots] = React.useState<string[]>(preferences.availableSlots);
    const [selectedStyles, setSelectedStyles] = React.useState<string[]>(preferences.teachingStyle);
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const handleSlotToggle = (slot: string) => {
        setSelectedSlots(prev => 
            prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
        );
    }
    
    const handleStyleToggle = (style: string) => {
        setSelectedStyles(prev =>
            prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
        );
    }

    const handleSave = async () => {
        setIsSaving(true);
        const ok = await updateFacultyPreferences(userId!, selectedSlots, selectedStyles);
        setIsSaving(false);
        setIsEditing(false);
        toast(ok
            ? { title: 'Preferences Updated!', description: 'Your teaching preferences have been saved.', action: <Check className="h-5 w-5 text-green-500" /> }
            : { variant: 'destructive', title: 'Error', description: 'Could not save preferences.' }
        );
    }
    
    const handleCancel = () => {
        // Reset to original preferences from props
        setSelectedSlots(preferences.availableSlots);
        setSelectedStyles(preferences.teachingStyle);
        setIsEditing(false);
    }

    const allSlotOptions = ['Morning', 'Evening'];
    const allTeachingStyleOptions = ['PPT-based', 'Real-world focused', 'Fast-paced', 'Slow-paced', 'Question-heavy', 'Theory-focused'];

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="text-lg font-semibold text-gray-700 dark:text-white">Teaching Preferences</span>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3 text-gray-600 dark:text-gray-300">Available Slots</h4>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? allSlotOptions : selectedSlots).map(slot => (
              <button key={slot} onClick={() => isEditing && handleSlotToggle(slot)} 
                className={cn(
                    "px-3 py-1 rounded-full text-sm border", 
                    selectedSlots.includes(slot) ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300" : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
                    isEditing && "hover:bg-gray-200 dark:hover:bg-gray-700",
                    !isEditing && "cursor-default"
                )}>
                {slot}
              </button>
            ))}
            {selectedSlots.length === 0 && !isEditing && <p className="text-sm text-muted-foreground">No slots selected.</p>}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-gray-600 dark:text-gray-300">Teaching Style</h4>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? allTeachingStyleOptions : selectedStyles).map(style => (
              <button key={style} onClick={() => isEditing && handleStyleToggle(style)} 
                className={cn(
                    "px-3 py-1 rounded-full text-sm border", 
                    selectedStyles.includes(style) ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300" : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
                    isEditing && "hover:bg-gray-200 dark:hover:bg-gray-700",
                     !isEditing && "cursor-default"
                )}>
                  {style}
              </button>
            ))}
             {selectedStyles.length === 0 && !isEditing && <p className="text-sm text-muted-foreground">No styles selected.</p>}
          </div>
        </div>
        
        {isEditing && (
            <>
                <Separator />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                        {isSaving ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </>
        )}

        {!isEditing && (
            <>
                <Separator />
                <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/faculty-schedule?userId=${userId}`)}>
                    <View className="mr-2 h-4 w-4" />
                    View My Schedule
                </Button>
            </>
        )}
      </CardContent>
    </Card>
  );
}


function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const [userData, setUserData] = React.useState<ReturnType<typeof getUserData> extends Promise<infer T> ? T : never>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) { router.push('/'); return; }
    getUserData(userId).then(data => {
      if (!data) router.push('/');
      else setUserData(data as any);
      setLoading(false);
    });
  }, [userId, router]);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!userData) return null;
  
  if (userData.role === 'student') {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-16">
          <DashboardHeader name={userData.name} role="student" />
          <div className="space-y-8">
              <StudentStatsCards stats={userData.stats} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                      <EnrolledCourses courses={userData.courseList} userId={userId} />
                  </div>
                  <div>
                      <TimetableActions />
                  </div>
              </div>
               <Achievements achievements={userData.achievements} />
          </div>
        </div>
      </main>
    );
  }

  // Faculty Dashboard
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-16">
        <DashboardHeader name={userData.name} role="faculty" />
        <div className="space-y-8">
          <FacultyStatsCards stats={userData.stats} courses={userData.courses} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CourseManagement courses={userData.courses} />
            </div>
            <div>
              <TeachingPreferences preferences={userData.teachingPreferences} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader className="h-8 w-8 animate-spin text-purple-600" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}

    
