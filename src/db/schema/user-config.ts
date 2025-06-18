import { pgTable, text, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth"; // adjust import if needed

export const userConfig = pgTable("user_config", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  settings: json("settings").notNull(), // type this in app code with Zod/TS types

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});