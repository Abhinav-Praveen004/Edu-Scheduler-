"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, Loader, ShieldCheck, Wand2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { resolveConflictsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  timetableData: z.string().min(20, {
    message: "Please provide the timetable data.",
  }),
  conflictDescription: z.string().min(10, {
    message: "Please describe the conflict.",
  }),
});

type Suggestions = {
  suggestedResolutions: string;
  preventativeMeasures: string;
} | null;

export function ConflictResolver() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timetableData: "",
      conflictDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    const result = await resolveConflictsAction(values);
    setIsLoading(false);

    if (result.success && result.data) {
      setSuggestions(result.data);
      toast({
        title: "Success!",
        description: "AI has provided suggestions to resolve the conflict.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.error || "There was a problem with your request.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 md:p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="text-2xl font-headline font-semibold">Resolve Scheduling Conflicts</h2>
          <FormField
            control={form.control}
            name="timetableData"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Timetable Data</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste the generated timetable (or any timetable data) here."
                    {...field}
                    rows={8}
                  />
                </FormControl>
                <FormDescription>
                  Provide the timetable that contains conflicts.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conflictDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Conflict Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'CS101 and MA101 are scheduled at the same time for Year 1 students.'"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  Clearly describe the scheduling conflict you've identified.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader className="animate-spin" /> : <Wand2 />}
            Get Suggestions
          </Button>
        </form>
      </Form>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg shadow-sm bg-card">
          <Lightbulb className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">AI is analyzing conflicts and finding solutions...</p>
        </div>
      )}

      {suggestions && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <Lightbulb className="text-primary"/> Suggested Resolutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none text-sm text-foreground">
                <p className="whitespace-pre-wrap font-body">{suggestions.suggestedResolutions}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <ShieldCheck className="text-primary" /> Preventative Measures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none text-sm text-foreground">
                <p className="whitespace-pre-wrap font-body">{suggestions.preventativeMeasures}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
