"use client";

import { GraduationCap, User, Users, Mail, Lock, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { registerUser, getAvailableCourses } from "@/lib/demo-data";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const SLOT_OPTIONS = ["Morning", "Evening"];
const STYLE_OPTIONS = ["PPT-based", "Real-world focused", "Fast-paced", "Slow-paced", "Question-heavy", "Theory-focused"];

export default function RegisterPage() {
  const [role, setRole] = useState<"student" | "faculty">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Student: course selection
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  // Faculty: preferences
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    getAvailableCourses().then(setCourses);
  }, []);

  const toggleItem = <T,>(list: T[], item: T, setter: (v: T[]) => void) =>
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("All fields are required."); return; }
    setIsLoading(true);
    setError("");
    const result = await registerUser(
      name, email, password, role,
      role === "student" ? selectedCourses : undefined,
      role === "faculty" ? selectedSlots : undefined,
      role === "faculty" ? selectedStyles : undefined,
    );
    setIsLoading(false);
    if (result.success) {
      router.push(`/dashboard?userId=${result.userId}`);
    } else {
      setError(result.error ?? "Registration failed.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4"><ThemeSwitcher /></div>
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-3 bg-primary rounded-md">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">University Portal</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-center text-lg font-medium text-gray-600 dark:text-gray-300 mb-4">Select Your Role</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={role === "student" ? "default" : "outline"}
              onClick={() => setRole("student")}
              className={cn("py-6 flex-col h-auto", role === "student" && "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500 ring-offset-2 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300")}
            >
              <User className="mb-1 h-5 w-5" /> Student
            </Button>
            <Button
              variant={role === "faculty" ? "default" : "outline"}
              onClick={() => setRole("faculty")}
              className={cn("py-6 flex-col h-auto", role === "faculty" && "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500 ring-offset-2 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300")}
            >
              <Users className="mb-1 h-5 w-5" /> Faculty
            </Button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                <Input id="name" placeholder="Enter your full name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Enter your email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Create a password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              {/* Student: course enrollment */}
              {role === "student" && (
                <div>
                  <p className="text-sm font-medium mb-2">Enroll in Courses</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {courses.map((c) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`course-${c.id}`}
                          checked={selectedCourses.includes(c.id)}
                          onCheckedChange={() => toggleItem(selectedCourses, c.id, setSelectedCourses)}
                        />
                        <Label htmlFor={`course-${c.id}`} className="cursor-pointer text-sm">
                          {c.name} <span className="text-muted-foreground">({c.code}) — {c.credits} cr</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty: preferences */}
              {role === "faculty" && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Available Slots</p>
                    <div className="flex gap-3">
                      {SLOT_OPTIONS.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <Checkbox
                            id={`slot-${s}`}
                            checked={selectedSlots.includes(s)}
                            onCheckedChange={() => toggleItem(selectedSlots, s, setSelectedSlots)}
                          />
                          <Label htmlFor={`slot-${s}`} className="cursor-pointer text-sm">{s}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Teaching Style</p>
                    <div className="flex flex-wrap gap-3">
                      {STYLE_OPTIONS.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <Checkbox
                            id={`style-${s}`}
                            checked={selectedStyles.includes(s)}
                            onCheckedChange={() => toggleItem(selectedStyles, s, setSelectedStyles)}
                          />
                          <Label htmlFor={`style-${s}`} className="cursor-pointer text-sm">{s}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              {isLoading ? "Registering..." : `Register as ${role}`}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => router.push("/")} className="text-blue-600 hover:underline font-medium">
              Login
            </button>
          </p>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} University Portal. All rights reserved.</p>
      </footer>
    </main>
  );
}
