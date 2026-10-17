import "dotenv/config";

export const API_PORT = Number(process.env.API_PORT ?? 3000);
export const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
export const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://s15:s15@localhost:5433/matches";
