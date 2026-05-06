import { config } from 'dotenv';
config();

import '@/ai/flows/generate-optimal-timetable.ts';
import '@/ai/flows/resolve-scheduling-conflicts.ts';