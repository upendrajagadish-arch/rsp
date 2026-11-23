import { z } from "zod";

export const extractionConfirmSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  issuing_organization: z.string().min(1, "Issuer is required").max(500),
  recipient_name: z.string().min(1, "Recipient name is required").max(300),
  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .nullable(),
  expiration_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .nullable(),
  credential_number: z.string().max(200).optional().nullable(),
  credential_url: z.string().url().max(2000).optional().nullable().or(z.literal("")),
});

export type ExtractionConfirmInput = z.infer<typeof extractionConfirmSchema>;

export function parseExtractionConfirm(fields: unknown): ExtractionConfirmInput {
  const parsed = extractionConfirmSchema.safeParse(fields);
  if (!parsed.success) {
    throw new ExtractionConfirmValidationError(parsed.error.format());
  }
  return {
    ...parsed.data,
    credential_url: parsed.data.credential_url === "" ? null : parsed.data.credential_url ?? null,
  };
}

export class ExtractionConfirmValidationError extends Error {
  constructor(public readonly details: z.ZodFormattedError<ExtractionConfirmInput>) {
    super("Invalid extraction confirmation fields");
    this.name = "ExtractionConfirmValidationError";
  }
}