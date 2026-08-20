import { z } from "zod";

export const commentGetSchema = z.object({
    index: z.coerce.number().int().min(0).default(0),
});

export const commentPostSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    comment: z.string().min(1),
});
