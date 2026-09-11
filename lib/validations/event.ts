
import { z } from "zod";

export const createEventSchema = z.object({
  name: z
    .string()
    .min(1, "Event name is required"),

  description: z
    .string()
    .optional(),

  eventDate: z
    .string()
    .optional(),
});


