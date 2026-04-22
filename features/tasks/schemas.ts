import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const preferredTimeOfDaySchema = z.enum(["any", "morning", "afternoon", "evening"]);

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  status: taskStatusSchema.optional(),
  deadline: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.coerce.number().int().positive(),
  remainingMinutes: z.coerce.number().int().nonnegative().optional(),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  splittable: z.coerce.boolean().optional(),
  preferredTimeOfDay: preferredTimeOfDaySchema.optional()
});

export const taskPatchSchema = taskCreateSchema.partial().extend({
  // estimatedMinutes should not be set to 0 by accident when patching
  estimatedMinutes: z.coerce.number().int().positive().optional()
});

