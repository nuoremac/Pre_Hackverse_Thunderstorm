import { z } from "zod";

export const preferencesSchema = z.object({
  timezoneOffsetMinutes: z.coerce.number().int().min(-14 * 60).max(14 * 60),
  workdayStartMinutes: z.coerce.number().int().min(0).max(24 * 60),
  workdayEndMinutes: z.coerce.number().int().min(0).max(24 * 60),
  maxWorkMinutesPerDay: z.coerce.number().int().min(0).max(24 * 60),
  focusBlockMinutes: z.coerce.number().int().min(15).max(6 * 60),
  breakMinutes: z.coerce.number().int().min(0).max(120),
  bufferMinutesBetweenSessions: z.coerce.number().int().min(0).max(60),
  allowedWeekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1)
});

export const preferencesPatchSchema = preferencesSchema.partial();

