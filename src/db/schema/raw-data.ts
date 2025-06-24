import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const rawDepotDataSet = pgTable("raw_depot_data_set", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  data: text("data").notNull(), // encrypted JSON string

  fileName: text("file_name").notNull(),

  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),

  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const rawAccountDataSet = pgTable("raw_account_data_set", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  data: text("data").notNull(), // encrypted JSON string

  fileName: text("file_name").notNull(),

  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),

  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
