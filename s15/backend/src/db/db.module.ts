import { Global, Module } from "@nestjs/common";
import { db, pool } from "./client";

export const DB = Symbol("DB");
export const PG_POOL = Symbol("PG_POOL");

@Global()
@Module({
  providers: [
    { provide: DB, useValue: db },
    { provide: PG_POOL, useValue: pool },
  ],
  exports: [DB, PG_POOL],
})
export class DbModule {}
