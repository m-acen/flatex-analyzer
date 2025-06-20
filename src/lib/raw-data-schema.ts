  import { z } from "zod";

  export const baseRawDataSchema = z.object({
    id: z.string().min(1),
    encryptedData: z.string().min(1),
    fileName: z.string().min(1),
    timestamp: z.coerce.date(), // allows strings, converts to Date
  });

  export const rawDataPayloadSchema = z.object({
    depot: z.array(baseRawDataSchema),
    account: z.array(baseRawDataSchema),
  });

  // For TypeScript usage
  export type BaseRawData = z.infer<typeof baseRawDataSchema>;
  export type RawDataPayload = z.infer<typeof rawDataPayloadSchema>;
