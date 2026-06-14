/**
 * Client-side validation schema for the reset-password form (design §5.3).
 * newPassword must be 8..128; confirmPassword must match. The server
 * revalidates length (RN-AUTH). Single source of truth, reusable in tests.
 */
import { z } from "zod";
import { copy } from "@/lib/copy/es-AR";

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, copy.reset.passwordShort)
      .max(128, copy.reset.passwordShort),
    confirmPassword: z.string().min(1, copy.reset.mismatch),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: copy.reset.mismatch,
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const resetPasswordDefaults: ResetPasswordFormValues = {
  newPassword: "",
  confirmPassword: "",
};
