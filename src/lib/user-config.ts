import { z } from "zod";

export enum DataPersistenceMode {
  NONE = "none",
  LOCAL = "local",
  SERVER = "server",
}

export const UserConfigSchema = z.object({
  dataPersistenceMode: z.nativeEnum(DataPersistenceMode).default(DataPersistenceMode.NONE),
});
