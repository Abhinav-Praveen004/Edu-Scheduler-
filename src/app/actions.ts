"use server";

export async function generateTimetableAction(input: {
  courseInformation: string;
  studentPreferences: string;
  lecturerConstraints: string;
}) {
  return { success: false, error: "AI generation not configured." };
}

export async function resolveConflictsAction(input: {
  timetableData: string;
  conflictDescription: string;
}): Promise<{ success: boolean; error?: string; data?: { suggestedResolutions: string; preventativeMeasures: string } }> {
  return { success: false, error: "AI conflict resolution not configured." };
}
