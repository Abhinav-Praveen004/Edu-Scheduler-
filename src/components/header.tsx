
import { Icons } from "@/components/icons";
import { Wand2 } from "lucide-react";

export function Header() {
  return (
    <header className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-3">
        <div className="p-3 bg-primary rounded-full">
          <Wand2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-center tracking-tight text-primary">
          TimeWise
        </h1>
      </div>
      <p className="mt-2 text-center text-lg text-muted-foreground">
        AI-Powered Timetable Generation & Conflict Resolution
      </p>
    </header>
  );
}
