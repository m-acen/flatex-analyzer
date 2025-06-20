import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
