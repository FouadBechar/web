import { z } from "zod";
export const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
export const postSchema = z.object({ title: z.string().min(3), content: z.string().min(10) });
export const commentSchema = z.object({ postId: z.number(), content: z.string().min(1) });
