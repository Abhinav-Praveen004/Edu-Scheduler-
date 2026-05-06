"use client";

import { GraduationCap, User, Users, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { loginUser, getAllUsers, DemoUser } from "@/lib/demo-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function LoginPage() {
  const [role, setRole] = useState<"student" | "faculty">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const router = useRouter();

  useEffect(() => {
    getAllUsers().then(setDemoUsers);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setError("");
    const user = await loginUser(email, password, role);
    setIsLoading(false);
    if (user) {
      router.push(`/dashboard?userId=${user.id}`);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleSelectDemoUser = (userId: string) => {
    const user = demoUsers.find((u) => u.id === userId);
    if (user) {
      setRole(user.role);
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  const filtered = demoUsers.filter((u) => u.role === role);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-3 bg-primary rounded-md">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">EduScheduler</h1>
          <p className="text-muted-foreground">Smart Timetable Scheduler</p>
        </div>
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-center text-lg font-medium text-gray-600 dark:text-gray-300">Select Your Role</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={role === "student" ? "default" : "outline"}
              onClick={() => setRole("student")}
              className={cn("py-6 flex-col h-auto", role === "student" && "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500 ring-offset-2 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300")}
            >
              <User className="mb-1 h-5 w-5" />
              Student
            </Button>
            <Button
              variant={role === "faculty" ? "default" : "outline"}
              onClick={() => setRole("faculty")}
              className={cn("py-6 flex-col h-auto", role === "faculty" && "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500 ring-offset-2 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300")}
            >
              <Users className="mb-1 h-5 w-5" />
              Faculty
            </Button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="email">Registered Email ID</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Enter your email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Enter your password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? "Logging in..." : `Login as ${role}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-3"
              onClick={() => router.push("/register")}
            >
              Create a new account
            </Button>
          </form>

          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Demo Credentials:</h4>
            <Select onValueChange={handleSelectDemoUser}>
              <SelectTrigger>
                <SelectValue placeholder={`Select a ${role}`} />
              </SelectTrigger>
              <SelectContent>
                {filtered.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} EduScheduler. All rights reserved.</p>
      </footer>
    </main>
  );
}
