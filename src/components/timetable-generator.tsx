
"use client";

import { Clock, Loader, Sparkles, Wand2, ArrowLeft, ArrowRight, BookCheck, Gauge, Presentation, MessageSquare, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ParsedTimetable, TimetableEntry, Course } from "@/lib/types";
import { ExportButtons } from "./export-buttons";
import { parseTimetable, TimetableDisplay } from "./timetable-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData, saveTimetable } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 1, name: 'Review Courses', icon: BookCheck },
  { id: 2, name: 'Time Slot', icon: Clock },
  { id: 3, name: 'Teaching Pace', icon: Gauge },
  { id: 4, name: 'Teaching Style', icon: Presentation },
  { id: 5, name: 'Learning Style', icon: MessageSquare },
  { id: 6, name: 'Generate', icon: Wand2 },
];

function checkUpcomingClasses(timetable: ParsedTimetable | null) {
    if (!timetable) return [];
  
    const now = new Date();
    const upcoming = [];
    const todayIndex = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  
    for (const row of timetable.rows) {
      const [startTimeStr] = row.time.split(' - ');
      const [hour, minute] = startTimeStr.split(':').map(Number);
      
      const classTime = new Date();
      classTime.setHours(hour, minute, 0, 0);
  
      const timeDiff = classTime.getTime() - now.getTime();
      const isToday = row.days[todayIndex];
  
      if (isToday && timeDiff > 0 && timeDiff <= 60 * 60 * 1000) { // Within the next hour
        upcoming.push({
          ...isToday,
          time: startTimeStr,
        });
      }
    }
    return upcoming;
}

// Hardcoded generation function
const generateHardcodedTimetable = (courses: Course[], preference: 'morning' | 'afternoon'): ParsedTimetable => {
  const headers = ["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const morningSlots = ["8:00 - 9:00", "9:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00"];
  const afternoonSlots = ["13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"];
  const timeSlots = preference === 'morning' ? morningSlots : afternoonSlots;

  const rows: ParsedTimetable['rows'] = [];
  const coursePool = [...courses];
  const lecturers = ["Dr. Smith", "Prof. Doe", "Dr. Jones", "Prof. Stark", "Dr. Banner"];
  const locations = ["Hall A", "Room 201", "Lab 3", "EE Building", "Chem Lab"];

  let courseIndex = 0;

  for (const time of timeSlots) {
      const days: (TimetableEntry | null)[] = [];
      for (let i = 0; i < 5; i++) { // For 5 days
          // Simple "random" distribution
          if (coursePool.length > 0 && Math.random() > 0.4) {
              const course = coursePool[courseIndex % coursePool.length];
              days.push({
                  course: course.name,
                  lecturer: lecturers[Math.floor(Math.random() * lecturers.length)],
                  location: locations[Math.floor(Math.random() * locations.length)],
              });
              courseIndex++;
          } else {
              days.push(null);
          }
      }
      rows.push({ time, days });
  }

  return { headers, rows };
};


export function TimetableGenerator({ userData }: { userData: UserData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState<ParsedTimetable | null>(null);
  const [studentPreference, setStudentPreference] = useState<"morning" | "afternoon">("morning");
  const [teachingPace, setTeachingPace] = useState("Fast-paced");
  const [teachingStyle, setTeachingStyle] = useState("PPT-based");
  const [learningStyle, setLearningStyle] = useState("Question-heavy");

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const { courseList } = userData;

  useEffect(() => {
    if (generatedTimetable) {
        const upcomingClasses = checkUpcomingClasses(generatedTimetable);
        upcomingClasses.forEach(cls => {
            toast({
                title: 'Upcoming Class Reminder',
                description: `${cls.course} with ${cls.lecturer} is starting at ${cls.time} in ${cls.location}.`,
                action: <Bell className="h-5 w-5 text-blue-500" />
            });
        });
    }
  }, [generatedTimetable, toast]);

  async function handleGenerate() {
    setIsLoading(true);
    setGeneratedTimetable(null);
    setCurrentStep(6); 

    // Simulate a short delay to feel like it's processing
    setTimeout(async () => {
        try {
            const hardcodedTimetable = generateHardcodedTimetable(courseList, studentPreference);
            setGeneratedTimetable(hardcodedTimetable);
            if (userId) {
                await saveTimetable(userId, studentPreference, hardcodedTimetable);
            }
            toast({
                title: "Success!",
                description: "Your timetable has been generated and saved.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem generating the hardcoded timetable.",
            });
            console.error("Failed to generate hardcoded timetable:", error);
        } finally {
            setIsLoading(false);
        }
    }, 1000); // 1-second delay
  }
  
  const progress = ((currentStep -1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-8">
        <Card className="p-4 md:p-6 border rounded-lg shadow-sm bg-card">
            <h2 className="text-2xl font-headline font-semibold mb-2">Generate Your Timetable</h2>
            <p className="text-muted-foreground mb-6">Follow the steps to create your personalized schedule.</p>
            
            <div className="mb-8">
                <Progress value={progress} className="h-2" />
                <ol className="grid grid-cols-3 sm:grid-cols-6 mt-2 text-xs font-medium text-center text-muted-foreground">
                    {steps.map(step => (
                        <li key={step.id} className={cn("flex items-center justify-center gap-2", currentStep >= step.id && "text-primary")}>
                            <step.icon className="h-4 w-4" />
                            <span>{step.name}</span>
                        </li>
                    ))}
                </ol>
            </div>
            
            {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Your Allotted Courses</h3>
                        <Card>
                            <CardContent className="p-4 space-y-3 max-h-60 overflow-y-auto">
                                {courseList.map((course, index) => (
                                    <div key={index} className="text-sm p-2 rounded-md bg-muted/50">
                                        <p className="font-semibold text-foreground">{course.name}</p>
                                        <p className="text-muted-foreground text-xs">{course.details}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={() => setCurrentStep(2)}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
            
            {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">When would you like to attend classes?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setStudentPreference("morning")}
                                className={cn(
                                    "p-4 rounded-lg border-2 text-left",
                                    studentPreference === "morning"
                                    ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
                                    : "bg-muted/50 hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Morning Slots</p>
                                        <p className="text-sm text-muted-foreground">8:00 AM - 12:00 PM</p>
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => setStudentPreference("afternoon")}
                                className={cn(
                                    "p-4 rounded-lg border-2 text-left",
                                    studentPreference === "afternoon"
                                    ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
                                    : "bg-muted/50 hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Afternoon Slots</p>
                                        <p className="text-sm text-muted-foreground">1:00 PM - 5:00 PM</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => setCurrentStep(3)}>
                           Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">What teaching pace do you prefer?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => setTeachingPace("Fast-paced")} className={cn("p-4 rounded-lg border-2 text-left", teachingPace === "Fast-paced" ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" : "bg-muted/50 hover:bg-muted")}>
                                <p className="font-semibold">Fast-paced</p>
                                <p className="text-sm text-muted-foreground">Quick delivery, covers more topics</p>
                            </button>
                            <button onClick={() => setTeachingPace("Slow-paced")} className={cn("p-4 rounded-lg border-2 text-left", teachingPace === "Slow-paced" ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" : "bg-muted/50 hover:bg-muted")}>
                                <p className="font-semibold">Slow-paced</p>
                                <p className="text-sm text-muted-foreground">Detailed explanations, thorough coverage</p>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(2)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => setCurrentStep(4)}>
                           Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">What teaching style works best for you?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => setTeachingStyle("PPT-based")} className={cn("p-4 rounded-lg border-2 text-left", teachingStyle === "PPT-based" ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" : "bg-muted/50 hover:bg-muted")}>
                                <p className="font-semibold">PPT-based</p>
                                <p className="text-sm text-muted-foreground">Structured presentations and slides</p>
                            </button>
                            <button onClick={() => setTeachingStyle("Real-world focused")} className={cn("p-4 rounded-lg border-2 text-left", teachingStyle === "Real-world focused" ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" : "bg-muted/50 hover:bg-muted")}>
                                <p className="font-semibold">Real-world focused</p>
                                <p className="text-sm text-muted-foreground">Practical applications and examples</p>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(3)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => setCurrentStep(5)}>
                           Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">How do you learn best?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => setLearningStyle("Question-heavy")} className={cn("p-4 rounded-lg border-2 text-left", learningStyle === "Question-heavy" ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" : "bg-muted/50 hover:bg-muted")}>
                                <p className="font-semibold">Question-heavy</p>
                                <p className="text-sm text-muted-foreground">Lots of interaction and Q&A sessions</p>
                            </button>
                            <button onClick={() => setLearningStyle("Theory-focused")} className={cn("p-4 rounded-lg border-2 text-left", learningStyle === "Theory-focused" ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" : "bg-muted/50 hover:bg-muted")}>
                                <p className="font-semibold">Theory-focused</p>
                                <p className="text-sm text-muted-foreground">Structured lectures and concepts</p>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(4)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={handleGenerate} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Wand2 className="mr-2" /> Generate My Timetable
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 6 && (
                <div className="animate-in fade-in">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg shadow-sm bg-card">
                      <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                      <p className="text-muted-foreground">Crafting your optimal schedule...</p>
                    </div>
                  )}

                  {!isLoading && generatedTimetable && (
                    <div className="space-y-6">
                        <TimetableDisplay timetable={generatedTimetable} />
                        <ExportButtons timetable={generatedTimetable} className="mt-6" />
                        <div className="flex justify-center">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                Start Over
                            </Button>
                        </div>
                    </div>
                  )}
                  
                  {!isLoading && !generatedTimetable && (
                     <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg shadow-sm bg-card">
                       <p className="text-muted-foreground">Something went wrong. Please try again.</p>
                       <div className="flex gap-4">
                           <Button variant="outline" onClick={() => setCurrentStep(5)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                           </Button>
                           <Button onClick={handleGenerate} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                <Wand2 className="mr-2" /> Try Again
                           </Button>
                       </div>
                     </div>
                  )}
                </div>
            )}
        </Card>
    </div>
  );
}

    

    

    