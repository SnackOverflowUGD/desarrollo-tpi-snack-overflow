/**
 * Client-side validation schema for the registration form (design §5).
 * Mirrors the backend rules but is deliberately tolerant on phone/email to
 * avoid false negatives — the server revalidates (RN-REG-03). Single source of
 * truth for the form, reusable by unit tests.
 */
import { z } from "zod";
import { copy } from "@/lib/copy/es-AR";

// Tolerant AR phone: accepts with/without +54, spaces and dashes, >= 8 digits.
// The country code is a fully optional group — local numbers (e.g. "1165432100",
// "3764123456") must validate without a leading 54.
const PHONE_RE = /^(\+?54)?[\s-]?(\d[\s-]?){8,}$/;

export const registroSchema = z
  .object({
    role: z.enum(["cliente", "prestador"], {
      message: copy.fieldErrors.role,
    }),
    name: z
      .string()
      .trim()
      .min(1, copy.fieldErrors.name)
      .max(100, copy.fieldErrors.name),
    lastName: z
      .string()
      .trim()
      .min(1, copy.fieldErrors.lastName)
      .max(100, copy.fieldErrors.lastName),
    email: z
      .string()
      .trim()
      .min(1, copy.fieldErrors.email)
      .max(255, copy.fieldErrors.email)
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, copy.fieldErrors.email),
    phone: z
      .string()
      .trim()
      .min(1, copy.fieldErrors.phone)
      .max(30, copy.fieldErrors.phone)
      .regex(PHONE_RE, copy.fieldErrors.phone),
    password: z
      .string()
      .min(8, copy.fieldErrors.password)
      .max(128, copy.fieldErrors.password),
    // '' = not selected; conditionally required below. Defaulted via
    // registroDefaults (kept a plain string so resolver input == output type).
    trade: z.string(),
  })
  .superRefine((data, ctx) => {
    // trade is required only when registering as prestador (REQ-03, ESC-UI-06).
    if (data.role === "prestador" && data.trade.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["trade"],
        message: copy.fieldErrors.trade,
      });
    }
  });

export type RegistroFormValues = z.infer<typeof registroSchema>;

/** Initial form values. role '' would fail the enum, so the field starts unset. */
export const registroDefaults: RegistroFormValues = {
  role: "" as RegistroFormValues["role"],
  name: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  trade: "",
};
