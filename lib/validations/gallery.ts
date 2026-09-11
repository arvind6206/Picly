import { z } from "zod";

export const createGallerySchema = z.object({
  pin: z.string().min(4, "PIN must be at least 4 characters"),
});

export const publishGallerySchema = z.object({
  pin: z.string().min(4, "PIN must be at least 4 characters"),
});
