import { z } from "zod";

export const fixedEventCreateSchema = z.object({
  title: z.string().min(1).max(200),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().max(200).optional().nullable()
}).refine((v) => Date.parse(v.endAt) > Date.parse(v.startAt), {
  message: "endAt must be after startAt",
  path: ["endAt"]
});

export const fixedEventPatchSchema = fixedEventCreateSchema.partial()
  .extend({
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional()
  })
  .refine((v) => {
    if (!v.startAt || !v.endAt) return true;
    return Date.parse(v.endAt) > Date.parse(v.startAt);
  }, { message: "endAt must be after startAt", path: ["endAt"] });

