import { z } from "zod";

const fixedEventBaseSchema = z.object({
  title: z.string().min(1).max(200),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().max(200).optional().nullable()
});

export const fixedEventCreateSchema = fixedEventBaseSchema.refine((v) => Date.parse(v.endAt) > Date.parse(v.startAt), {
  message: "endAt must be after startAt",
  path: ["endAt"]
});

export const fixedEventPatchSchema = fixedEventBaseSchema.partial()
  .refine((v) => {
    if (!v.startAt || !v.endAt) return true;
    return Date.parse(v.endAt) > Date.parse(v.startAt);
  }, { message: "endAt must be after startAt", path: ["endAt"] });
