/**
 * Client-side validation schema for the login form (design §5.1).
 * Deliberately LAX: login never enforces a password length (an old password
 * could be shorter than the current policy, spec REQ-01 / ESC-UI-05). The
 * server revalidates. Single source of truth for the form, reusable in tests.
 */
import { z } from "zod";
import { copy } from "@/lib/copy/es-AR";

// Same email regex as the registration schema (lib/validation/registro.ts).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, copy.fieldErrors.email)
    .max(255, copy.fieldErrors.email)
    .regex(EMAIL_RE, copy.fieldErrors.email),
  // Non-empty only — NO min length (spec REQ-01).
  password: z.string().min(1, copy.fieldErrors.required),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginDefaults: LoginFormValues = {
  email: "",
  password: "",
};
